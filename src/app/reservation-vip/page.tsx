import type { Metadata } from 'next'
import Image from 'next/image'
import { ArrowDown, ArrowUpRight, Check, ShieldCheck, Sparkles, Users, CarFront, HeartHandshake, MapPin } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PayDepositButton from './PayDepositButton'
import s from './page.module.css'

export const metadata: Metadata = {
  title: 'Réservation VIP | Conciergerie Omra SAFARUMA',
  description: 'Votre Omra privée, pensée dans les moindres détails : guides dédiés, hôtels de prestige, véhicules de luxe et conciergerie familiale.',
}
const attentions = [
  { icon: CarFront, title: 'Voyager avec élégance', text: 'Berline, 4×4 ou van de luxe, accueil et retour à l’aéroport, déplacements entre Makkah et Médine.' },
  { icon: Users, title: 'Votre famille, entourée', text: 'Un ou plusieurs guides privés, une nounou pour les enfants et une organisation adaptée au rythme de chacun.' },
  { icon: Sparkles, title: 'Les détails qui comptent', text: 'Recherche d’un hôtel de prestige, réservations, ihrams de qualité et préparation de votre arrivée.' },
  { icon: ShieldCheck, title: 'Discrétion & sérénité', text: 'Un échange confidentiel pour préparer vos besoins de discrétion, de sécurité et d’organisation privilégiée.' },
]
export default function ReservationVipPage() {
  return <>
    <Navbar transparentOnHero darkHeroMode />
    <main className={s.page}>
      <section className={`sfr-section ${s.hero}`} aria-labelledby="vip-title">
        <Image src="/images/landing/experience-acces.jpg" alt="Intérieur élégant avec une vue panoramique sur le Haram à Makkah" fill preload sizes="100vw" className={s.heroImage} />
        <div className={s.heroShade} />
        <div className={s.heroContent}>
          <p className={s.signature}>SAFARUMA <span>Collection privée</span></p>
          <h1 id="vip-title">Un voyage sacré.<br />Une attention<br />d’exception.</h1>
          <p className={s.heroIntro}>Votre Omra privée, orchestrée dans les moindres détails. Le confort d’un séjour de prestige. La liberté de vous consacrer à l’essentiel.</p>
          <a href="#consultation" className={s.primaryLink}>Créer mon séjour privé <ArrowUpRight size={18} aria-hidden="true" /></a>
          <p className={s.heroNote}>Un programme sur mesure, après votre consultation privée.</p>
        </div>
        <div className={s.heroBottom}><span>Makkah & Médine</span><a href="#experience">Découvrir l’expérience <ArrowDown size={15} aria-hidden="true" /></a><span>Conciergerie Omra VIP</span></div>
      </section>
      <section id="experience" className={`sfr-section ${s.introduction}`} aria-labelledby="experience-title">
        <p className={s.sectionLabel}>L’expérience SAFARUMA privée</p>
        <h2 id="experience-title">Vous vivez le voyage.<br />Nous en pensons chaque détail.</h2>
        <p>Pour les personnalités et les familles qui recherchent une expérience intime et un accompagnement de grande qualité. Votre organisateur réunit autour de vous les services dont vous avez besoin, de votre arrivée jusqu’à votre départ.</p>
        <div className={s.promises}><span><ShieldCheck size={18} aria-hidden="true" /> Discrétion</span><span><HeartHandshake size={18} aria-hidden="true" /> Interlocuteur dédié</span><span><MapPin size={18} aria-hidden="true" /> Programme sur mesure</span></div>
      </section>
      <section className={`sfr-section ${s.experiences}`} aria-label="Votre séjour privé">
        <article><Image src="/images/landing/hero-kaaba-main.jpg" alt="La Kaaba et les arcades du Masjid al-Haram dans la lumière dorée" fill sizes="(max-width: 760px) 100vw, 60vw" /><div className={s.imageShade} /><div className={s.experienceText}><p>Au plus près de l’essentiel</p><h3>Votre spiritualité.<br />Votre rythme.</h3><span>Des guides privés certifiés pour vous accompagner et donner du sens à chaque étape de votre Omra.</span></div></article>
        <article><Image src="/images/landing/testi-bg.jpg" alt="Les minarets de Médine à la tombée du jour" fill sizes="(max-width: 760px) 100vw, 40vw" /><div className={s.imageShade} /><div className={s.experienceText}><p>Un itinéraire qui vous ressemble</p><h3>Médine,<br />autrement.</h3><span>Plus de 25 lieux à découvrir à Makkah et Médine pour composer votre programme privé.</span></div></article>
      </section>
      <section className={`sfr-section ${s.concierge}`} aria-labelledby="concierge-title">
        <div><p className={s.sectionLabel}>Une conciergerie à votre mesure</p><h2 id="concierge-title">Le luxe de n’avoir<br />qu’à vous laisser guider.</h2><p className={s.description}>Un séjour en famille, une demande particulière, une arrivée à organiser. Nous recherchons et coordonnons les solutions adaptées à vos attentes.</p></div>
        <div className={s.attentions}>{attentions.map(({ icon: Icon, title, text }) => <article key={title}><Icon size={25} strokeWidth={1.25} aria-hidden="true" /><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
      </section>
      <section className={`sfr-section ${s.privateMoment}`} aria-labelledby="private-title">
        <div className={s.privatePhoto}><Image src="/images/landing/experience-spirituel.jpg" alt="Vue paisible sur la Kaaba depuis les arcades du Haram" fill sizes="(max-width: 760px) 100vw, 50vw" /></div>
        <div className={s.privateCopy}><p className={s.sectionLabel}>Vos envies donnent le ton</p><h2 id="private-title">L’exception se trouve<br />dans l’attention.</h2><p>Un hôtel choisi selon vos préférences. Un véhicule confortable à votre arrivée. Plusieurs guides pour accompagner vos proches. Une aide pour vos enfants.</p><p>Lors de votre consultation, chaque souhait devient un point de départ pour construire votre séjour.</p><a href="#consultation" className={s.textLink}>Parlons de votre voyage <ArrowUpRight size={18} aria-hidden="true" /></a><small>Les services, la sécurité et les accès VIP sont étudiés selon les disponibilités, les autorisations et la faisabilité de votre demande.</small></div>
      </section>
      <section id="consultation" className={`sfr-section ${s.consultation}`} aria-labelledby="consultation-title">
        <div><p className={s.sectionLabel}>Votre voyage commence par une rencontre</p><h2 id="consultation-title">Confiez-nous<br />votre projet.</h2><p className={s.description}>Une consultation privée de 60 minutes avec notre organisateur pour imaginer votre séjour, comprendre vos attentes et préparer votre programme.</p><ol className={s.steps}><li><span>01</span><div><h3>Réservez votre consultation</h3><p>Versez l’acompte de 500 €, puis choisissez votre rendez-vous.</p></div></li><li><span>02</span><div><h3>Échangeons sur vos envies</h3><p>Indiquez votre préférence WhatsApp ou Telegram et votre numéro pour l’entretien.</p></div></li><li><span>03</span><div><h3>Recevez votre proposition</h3><p>Après la consultation, nous vous adressons la facture des services retenus.</p></div></li></ol></div>
        <div className={s.depositCard}><span className={s.cardLabel}>Réservation VIP</span><h3>Votre consultation privée</h3><p className={s.amount}>500 <span>€</span></p><p className={s.depositLabel}>Acompte imputé sur votre facture finale</p><div className={s.cardRule} /><ul><li><Check size={17} aria-hidden="true" /> Entretien personnalisé de 60 minutes</li><li><Check size={17} aria-hidden="true" /> Étude de vos besoins et de votre séjour</li><li><Check size={17} aria-hidden="true" /> Organisation des services souhaités</li></ul><PayDepositButton /><p className={s.paymentNote}>Paiement sécurisé via Whop</p><p className={s.depositExplanation}>Les 500 € constituent un acompte sur votre prestation finale. Le prix total de votre séjour sera établi après consultation, selon les services que vous aurez choisis.</p></div>
      </section>
    </main>
    <Footer />
  </>
}
