import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

// Regression: hosted sandbox checkout displayed EUR 525 for an advertised EUR 500
// because the provider inherited exclusive tax pricing. Prices are client totals.
test('Whop standard and VIP checkout preserve the client total', async () => {
  const require = createRequire(import.meta.url)
  type CheckoutInput = { variant: { initial_price: number; override_tax_type?: string; stock?: number; unlimited_stock?: boolean } }
  const calls: CheckoutInput[] = []
  const client = { checkoutConfigurations: {
    create: async (input: CheckoutInput) => { calls.push(input); return { id: 'ch_fixture', purchase_url: 'https://sandbox.whop.com/checkout/ch_fixture' } },
    delete: async () => {},
  } }
  function load<T>(file: string): T {
    const mod = { exports: {} }
    vm.runInNewContext(ts.transpileModule(readFileSync(file,'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, {
      module:mod,exports:mod.exports,process:{env:{WHOP_API_KEY:'fixture',WHOP_ENVIRONMENT:'sandbox',VIP_CALENDLY_URL:'https://calendly.com/test',NEXTAUTH_URL:'https://qa.example.test'}},console,
      require(name: string) {
        if(name==='@whop/sdk') return {WhopClient: class { constructor(){return client} },WhopEnvironment:{Sandbox:'sandbox',Production:'production'}}
        if(name==='@/lib/prisma') return {__esModule:true,default:{vipConsultation:{create:async()=>({id:'vip_fixture'}),update:async()=>({}),delete:async()=>({})}}}
        if(name==='@/lib/ratelimit') return {checkRateLimit:async()=>null,contactRatelimit:null}
        if(name==='@/lib/payments/whop-provider') return {getWhopClient:()=>client}
        return require(name)
      },
    })
    return mod.exports as T
  }
  const provider=load<typeof import('../src/lib/payments/whop-provider')>('src/lib/payments/whop-provider.ts').whopPaymentProvider()
  await provider.createHostedCheckout({bookingRef:'SAF-QA',idempotencyKey:'fixture',amountCents:15500,currency:'EUR',productName:'Guide SAFARUMA',description:'Fixture',metadata:{refNumber:'SAF-QA'},successUrl:'https://qa.example.test/confirmation',cancelUrl:'https://qa.example.test/cancel',customerEmail:'fixture@example.test',expiresAt:new Date(Date.now()+1800000)})
  const standard=calls.at(-1)!
  assert.equal(standard.variant.initial_price,155)
  assert.equal(standard.variant.override_tax_type,'inclusive')
  assert.equal(standard.variant.stock,1)
  assert.equal(standard.variant.unlimited_stock,false)
  const vip=load<typeof import('../src/app/api/reservation-vip/create-session/route')>('src/app/api/reservation-vip/create-session/route.ts')
  const {NextRequest}=require('next/server')
  assert.equal((await vip.POST(new NextRequest('https://qa.example.test/api/reservation-vip/create-session',{method:'POST'}))).status,200)
  const deposit=calls.at(-1)!
  assert.equal(deposit.variant.initial_price,500)
  assert.equal(deposit.variant.override_tax_type,'inclusive')
  assert.equal(deposit.variant.stock,1)
  assert.equal(deposit.variant.unlimited_stock,false)
})

test('Whop closure never releases a booking while a payment is still collectible', async t => {
  const require = createRequire(import.meta.url)
  const mod = { exports: {} }
  vm.runInNewContext(ts.transpileModule(readFileSync('src/lib/payments/whop-provider.ts','utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText, { module: mod, exports: mod.exports, process, console, require })
  const close = (mod.exports as typeof import('../src/lib/payments/whop-provider')).closeWhopCheckout
  for (const [before, after, closed, paid] of [
    ['requires_confirmation','canceled',true,false],
    ['requires_action','requires_action',false,false],
    ['requires_capture','requires_capture',false,false],
    ['processing','processing',false,false],
    ['canceled','canceled',true,false],
    ['succeeded','succeeded',false,true],
  ] as const) {
    await t.test(`${before} → ${after}`, async () => {
      let canceled = false
      let salesClosed = false
      const fake = {
        checkoutConfigurations: { retrieve: async () => ({ variant: { id:'plan_fixture' }, metadata: { refNumber:'SAF-QA' } }) },
        variants: { update: async (input: {stock:number;unlimited_stock:boolean}) => {
          assert.equal(input.stock,0);assert.equal(input.unlimited_stock,false);salesClosed=true
        } },
        payments: {
          list: async () => {
            assert.equal(salesClosed,true,'Stop future sales before inspecting payments')
            return (async function*(){yield {id:'pay_fixture',checkout_configuration_id:'ch_fixture',voidable:true}})()
          },
          retrieveStatus: async () => ({status:canceled?after:before}),
          void: async () => {canceled=true},
        },
      }
      const result = await close(fake as unknown as Parameters<typeof close>[0],'ch_fixture','SAF-QA')
      assert.equal(result.closed,closed)
      assert.equal(result.paidPaymentId,paid?'pay_fixture':undefined)
      if(before==='succeeded'||before==='canceled')assert.equal(canceled,false)
    })
  }
  await t.test('a later page with an unsettled payment keeps the hold', async () => {
    const fake = {
      checkoutConfigurations:{retrieve:async()=>({variant:{id:'plan_fixture'},metadata:{refNumber:'SAF-QA'}})},
      variants:{update:async()=>{}},
      payments:{
        list:async()=>(async function*(){yield{id:'canceled',checkout_configuration_id:'ch_fixture',voidable:false};yield{id:'pending',checkout_configuration_id:'ch_fixture',voidable:false}})(),
        retrieveStatus:async({payment_id}:{payment_id:string})=>({status:payment_id==='canceled'?'canceled':'processing'}),
      },
    }
    assert.equal((await close(fake as unknown as Parameters<typeof close>[0],'ch_fixture','SAF-QA')).closed,false)
  })
})
