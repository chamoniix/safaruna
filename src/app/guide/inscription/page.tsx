'use client';

import { useState } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from 'next/link';

const STEPS = [
  "Informations personnelles",
  "Langues & formation",
  "Lieux & services",
  "Forfaits & tarifs",
  "Documents",
  "Charte islamique"
];

export default function GuideOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [acceptedCharte, setAcceptedCharte] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 6));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[var(--cream)]">
        <Navbar />
        <main className="max-w-2xl mx-auto px-6 py-32 text-center">
          <div className="bg-white rounded-3xl p-10 border border-[var(--sand)] shadow-lg">
            <div className="w-20 h-20 mx-auto bg-[var(--green-bg)] rounded-full flex items-center justify-center mb-6">
              <span className="text-[var(--green)] text-4xl">✓</span>
            </div>
            <h1 className="text-3xl font-serif text-[var(--deep)] mb-4">Dossier soumis avec succès</h1>
            <p className="text-[var(--muted)] mb-8">BarakAllahu fik. L&apos;équipe SAFARUNA a bien reçu votre candidature. Nous examinerons vos documents insha&apos;Allah et vous serez contacté sous 48h.</p>
            <Link href="/" className="btn-secondary inline-block">Retour à l&apos;accueil</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-24 pt-32">
        <div className="mb-10">
          <h1 className="text-3xl font-serif text-[var(--deep)] mb-2">Devenir Guide SAFARUNA</h1>
          <p className="text-[var(--muted)] max-w-2xl">Mettez votre savoir au service des pèlerins. Complétez ce formulaire pour rejoindre la première plateforme de guides privés pour l&apos;Omra.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* SIDEBAR STEPPER */}
          <div className="md:w-64 lg:w-80 shrink-0">
            <div className="sticky top-28 bg-white p-6 rounded-2xl border border-[var(--sand)] shadow-sm">
              <h3 className="text-xs uppercase tracking-wider font-bold text-[var(--muted)] mb-6">Étapes d&apos;inscription</h3>
              <ul className="space-y-6 relative before:absolute before:inset-y-0 before:left-4 before:w-[2px] before:bg-[var(--sand)]">
                {STEPS.map((stepName, i) => {
                  const stepNum = i + 1;
                  const isActive = currentStep === stepNum;
                  const isPast = currentStep > stepNum;
                  
                  return (
                    <li key={stepNum} className="relative flex items-center gap-4 z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isActive ? 'bg-[var(--gold)] text-[var(--deep)] border-2 border-[var(--gold)] shadow-[0_0_10px_rgba(201,168,76,0.5)]' : isPast ? 'bg-[var(--deep)] text-[var(--gold-light)] border-2 border-[var(--deep)]' : 'bg-white text-[var(--muted)] border-2 border-[var(--sand)]'}`}>
                        {isPast ? '✓' : stepNum}
                      </div>
                      <span className={`text-sm font-semibold ${isActive ? 'text-[var(--deep)]' : isPast ? 'text-[var(--deep)]' : 'text-[var(--muted)]'}`}>
                        {stepName}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* FORM CONTENT */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-2xl border border-[var(--sand)] shadow-sm min-h-[500px] flex flex-col justify-between">
              
              <div>
                {/* STEP 1 */}
                {currentStep === 1 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-2xl font-serif text-[var(--deep)] mb-6 border-b border-[var(--sand)] pb-4">1. Informations personnelles</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                      <div><label className="block text-sm font-semibold mb-1.5">Prénom</label><input type="text" className="w-full px-4 py-3 rounded-xl border border-[var(--sand)]" placeholder="Youssouf" required /></div>
                      <div><label className="block text-sm font-semibold mb-1.5">Nom</label><input type="text" className="w-full px-4 py-3 rounded-xl border border-[var(--sand)]" placeholder="Konaté" required /></div>
                      <div><label className="block text-sm font-semibold mb-1.5">WhatsApp</label><input type="tel" className="w-full px-4 py-3 rounded-xl border border-[var(--sand)]" placeholder="+966 50 123 4567" required /></div>
                      <div><label className="block text-sm font-semibold mb-1.5">Email</label><input type="email" className="w-full px-4 py-3 rounded-xl border border-[var(--sand)]" placeholder="youssouf@exemple.com" required /></div>
                      <div>
                        <label className="block text-sm font-semibold mb-1.5">Ville de résidence</label>
                        <select className="w-full px-4 py-3 rounded-xl border border-[var(--sand)] bg-white" required>
                          <option value="">Sélectionner</option>
                          <option value="makkah">Makkah</option>
                          <option value="madinah">Madinah</option>
                          <option value="jeddah">Jeddah</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1.5">Photo de profil</label>
                        <input type="file" className="w-full text-sm p-2 border border-[var(--sand)] rounded-xl" accept="image/*" />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-2xl font-serif text-[var(--deep)] mb-6 border-b border-[var(--sand)] pb-4">2. Langues & formation</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold mb-3">Langues parlées (Sélection multiple)</label>
                        <div className="flex flex-wrap gap-3">
                          {['🇫🇷 Français', '🇸🇦 Arabe Classique', '🇲🇦 Darija', '🇬🇧 Anglais', '🇹🇷 Turc', '🇸🇳 Wolof'].map(l => (
                            <label key={l} className="flex items-center gap-2 p-2 px-4 border border-[var(--sand)] rounded-full hover:bg-[var(--gold-pale)] cursor-pointer transition-colors">
                              <input type="checkbox" className="accent-[var(--gold-dark)]" />
                              <span className="text-sm font-medium">{l}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold mb-1.5">Formation Islamique</label>
                          <select className="w-full px-4 py-3 rounded-xl border border-[var(--sand)] bg-white" required>
                            <option value="">Niveau d&apos;étude</option>
                            <option value="uni">Université Islamique (Madinah/Umm Al-Qura...)</option>
                            <option value="institut">Institut spécialisé</option>
                            <option value="autodidacte">Autodidacte confirmé</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1.5">Années d&apos;expérience (Guide)</label>
                          <input type="number" min="0" max="40" className="w-full px-4 py-3 rounded-xl border border-[var(--sand)]" required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1.5">Votre biographie (Visible par les pèlerins)</label>
                        <textarea className="w-full px-4 py-3 rounded-xl border border-[var(--sand)]" rows={4} placeholder="Présentez-vous, votre approche, votre foi..." required></textarea>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {currentStep === 3 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-2xl font-serif text-[var(--deep)] mb-6 border-b border-[var(--sand)] pb-4">3. Lieux & services</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold mb-3">Lieux saints maîtrisés (Cochez tous ceux que vous pouvez guider)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {['Masjid Al-Haram', 'Jabal Al-Nour / Hira', 'Jabal Thawr', 'Zamzam (Explications)', 'Bataille de Badr', 'Masjid Quba', 'Jabal Uhud', 'Al-Baqi', 'Masjid Al-Qiblatayn', 'Arafat / Jabal Rahmah', 'Mina', 'Muzdalifah'].map(l => (
                            <label key={l} className="flex items-center gap-2 p-3 border border-[var(--sand)] rounded-xl hover:bg-[var(--gold-pale)] cursor-pointer transition-colors">
                              <input type="checkbox" className="accent-[var(--gold-dark)]" />
                              <span className="text-sm font-medium leading-tight">{l}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-3">Transport proposé</label>
                        <div className="flex flex-col gap-3">
                          <label className="flex items-center gap-3 p-4 border border-[var(--sand)] rounded-xl cursor-pointer hover:bg-[var(--gold-pale)]">
                            <input type="radio" name="transport" className="accent-[var(--gold-dark)] w-4 h-4" defaultChecked />
                            <div>
                              <span className="block font-bold">Aucun transport</span>
                              <span className="text-xs text-[var(--muted)]">Le pèlerin gère ses propres déplacements (Uber, Taxi)</span>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 p-4 border border-[var(--sand)] rounded-xl cursor-pointer hover:bg-[var(--gold-pale)]">
                            <input type="radio" name="transport" className="accent-[var(--gold-dark)] w-4 h-4" />
                            <div>
                              <span className="block font-bold">Voiture standard (4 places)</span>
                              <span className="text-xs text-[var(--muted)]">Je conduis les pèlerins dans mon véhicule de tourisme.</span>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 p-4 border border-[var(--sand)] rounded-xl cursor-pointer hover:bg-[var(--gold-pale)]">
                            <input type="radio" name="transport" className="accent-[var(--gold-dark)] w-4 h-4" />
                            <div>
                              <span className="block font-bold">Van familial (7-9 places)</span>
                              <span className="text-xs text-[var(--muted)]">Idéal pour les grandes familles ou groupes.</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4 */}
                {currentStep === 4 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-2xl font-serif text-[var(--deep)] mb-6 border-b border-[var(--sand)] pb-4">4. Forfaits & tarifs</h2>
                    <p className="text-sm text-[var(--muted)] mb-6">Définissez vos prix de base. La plateforme prélève une commission de 15% sur ces montants.</p>
                    <div className="space-y-6">
                      <div className="p-5 border border-[var(--sand)] rounded-xl bg-[var(--cream)]">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-[var(--deep)]">Forfait Omra Essentielle (3h - 5h)</h4>
                          <span className="text-[10px] bg-[var(--gold-pale)] text-[var(--gold-dark)] px-2 py-1 rounded font-bold uppercase tracking-wider">Obligatoire</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold mb-1">Prix par personne (€)</label>
                            <input type="number" className="w-full px-3 py-2 rounded-lg border border-[var(--sand)]" placeholder="ex: 120" required />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-1">Prix de groupe max (€)</label>
                            <input type="number" className="w-full px-3 py-2 rounded-lg border border-[var(--sand)]" placeholder="ex: 400" />
                          </div>
                        </div>
                      </div>

                      <div className="p-5 border border-[var(--sand)] rounded-xl">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-[var(--deep)]">Forfait Ziyara Histoire (Journée 8h)</h4>
                          <input type="checkbox" className="accent-[var(--gold-dark)] w-4 h-4" defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold mb-1">Prix par personne (€)</label>
                            <input type="number" className="w-full px-3 py-2 rounded-lg border border-[var(--sand)]" placeholder="ex: 200" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-1">Prix de groupe max (€)</label>
                            <input type="number" className="w-full px-3 py-2 rounded-lg border border-[var(--sand)]" placeholder="ex: 600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5 */}
                {currentStep === 5 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-2xl font-serif text-[var(--deep)] mb-6 border-b border-[var(--sand)] pb-4">5. Documents & KYC</h2>
                    <p className="text-sm text-[var(--muted)] mb-6">Ces documents sont obligatoires pour la vérification KYC et ne seront jamais rendus publics.</p>
                    <div className="space-y-6">
                      <div className="w-full border-2 border-dashed border-[var(--sand)] rounded-xl p-6 text-center hover:bg-[var(--gold-pale)] transition-colors cursor-pointer group">
                        <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">📄</span>
                        <h4 className="font-bold text-sm mb-1">Pièce d&apos;identité (Passeport / CNI)</h4>
                        <p className="text-xs text-[var(--muted)] mb-3">Format JPG, PNG ou PDF (Max 5Mo)</p>
                        <button type="button" className="text-xs font-bold text-[var(--gold-dark)] bg-white border border-[var(--sand)] px-4 py-2 rounded-full shadow-sm pointer-events-none">Parcourir...</button>
                      </div>
                      
                      <div className="w-full border-2 border-dashed border-[var(--sand)] rounded-xl p-6 text-center hover:bg-[var(--gold-pale)] transition-colors cursor-pointer group">
                        <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">🎓</span>
                        <h4 className="font-bold text-sm mb-1">Diplôme ou Certificat Islamique</h4>
                        <p className="text-xs text-[var(--muted)] mb-3">Optionnel mais fortement recommandé</p>
                        <button type="button" className="text-xs font-bold text-[var(--gold-dark)] bg-white border border-[var(--sand)] px-4 py-2 rounded-full shadow-sm pointer-events-none">Parcourir...</button>
                      </div>

                      <div className="pt-4 border-t border-[var(--sand)]">
                        <h4 className="font-bold text-sm mb-3">Coordonnées bancaires européennes (IBAN)</h4>
                        <p className="text-xs text-[var(--muted)] mb-4">Pour recevoir vos virements mensuels. Données cryptées AES-256 en base de données.</p>
                        <div>
                          <input type="text" className="w-full px-4 py-3 rounded-xl border border-[var(--sand)] font-mono text-sm uppercase tracking-widest" placeholder="FR76 0000 0000 0000 0000 0000 000" required />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 6 */}
                {currentStep === 6 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-2xl font-serif text-[var(--deep)] mb-6 border-b border-[var(--sand)] pb-4">6. Charte islamique & Serment</h2>
                    <div className="space-y-6">
                      <div className="bg-[#1A1209] p-6 rounded-2xl text-[var(--gold-light)] relative overflow-hidden">
                        <div className="absolute right-0 top-0 opacity-10 text-8xl font-serif leading-none pr-4">"</div>
                        <p className="font-serif italic text-lg text-center mb-4">&quot;Et remplissez l&apos;engagement, car on sera interrogé au sujet des engagements.&quot;</p>
                        <p className="text-center text-xs text-white/50 uppercase tracking-widest font-sans">Sourate Al-Isra (17:34)</p>
                      </div>
                      
                      <div className="space-y-4 bg-white border border-[var(--sand)] p-6 rounded-xl">
                        <h4 className="font-bold text-[var(--deep)]">Je m'engage devant Allah à :</h4>
                        <ul className="space-y-3 text-sm text-[var(--muted)]">
                           <li className="flex gap-2"><span className="text-[var(--gold)]">✓</span> N&apos;enseigner que ce qui est authentique selon le Coran et la Sunnah.</li>
                           <li className="flex gap-2"><span className="text-[var(--gold)]">✓</span> Ne pas percevoir de commissions cachées des commerçants ou hôtels.</li>
                           <li className="flex gap-2"><span className="text-[var(--gold)]">✓</span> Respecter la clause de non-contournement de SAFARUNA pour toute transaction avec les pèlerins rencontrés via la plateforme.</li>
                           <li className="flex gap-2"><span className="text-[var(--gold)]">✓</span> Être ponctuel, patient et bienveillant envers les pèlerins.</li>
                        </ul>
                      </div>

                      <label className="flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors bg-[var(--gold-pale)] border-[var(--gold)] mt-6">
                        <input type="checkbox" className="mt-1 w-5 h-5 text-[var(--gold)] rounded" checked={acceptedCharte} onChange={(e) => setAcceptedCharte(e.target.checked)} />
                        <span className="text-sm font-bold text-[var(--gold-dark)]">Je prends Allah à témoin que j&apos;ai lu et j&apos;accepte sans réserve les termes de cette charte islamique et les CGU de SAFARUNA.</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-between items-center mt-10 pt-6 border-t border-[var(--sand)]">
                {currentStep > 1 ? (
                  <button type="button" onClick={handlePrev} className="px-6 py-3 rounded-full border border-[var(--sand)] font-semibold text-[var(--muted)] hover:text-[var(--deep)] hover:border-[var(--deep)] transition-colors">
                    ← Précédent
                  </button>
                ) : <div></div>}

                {currentStep < 6 ? (
                  <button type="button" onClick={handleNext} className="px-8 py-3 rounded-full bg-[var(--deep)] text-[var(--gold-light)] font-bold hover:bg-[var(--warm)] transition-transform hover:-translate-y-0.5 shadow-md">
                    Continuer →
                  </button>
                ) : (
                  <button type="submit" disabled={!acceptedCharte} className="px-8 py-3 rounded-full bg-[var(--gold)] text-[var(--deep)] font-bold hover:bg-[var(--gold-dark)] hover:text-white transition-all shadow-[0_8px_20px_rgba(201,168,76,0.3)] disabled:opacity-50 disabled:cursor-not-allowed">
                    Soumettre mon dossier
                  </button>
                )}
              </div>

            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
