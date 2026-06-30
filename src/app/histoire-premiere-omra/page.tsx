import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Première Omra accompagnée | SAFARUMA',
  description:
    'Une histoire narrative sur la première Omra d’un homme et d’une femme avec un accompagnement personnalisé à La Mecque.',
};

export default function HistoirePremiereOmraPage() {
  return (
    <main className="seo-page">
      <section className="seo-hero">
        <p>Première Omra</p>
        <h1>Ils pensaient suivre la foule. Ils ont finalement compris chaque étape.</h1>
        <p>
          Pour beaucoup, la première Omra est un mélange d’attente, d’émotion et de peur de mal faire. Un guide privé
          peut transformer cette inquiétude en présence.
        </p>
        <Link href="/reservation">Préparer ma Omra</Link>
      </section>
      <section className="seo-content">
        <h2>Le départ</h2>
        <p>
          Il avait appris les grandes étapes dans des vidéos. Elle avait préparé une liste de questions dans son
          téléphone. À leur arrivée, tout semblait immense : la foule, les couloirs, les appels, l’émotion de s’approcher
          enfin de la Maison sacrée.
        </p>
        <h2>Le moment où tout ralentit</h2>
        <p>
          Leur guide les a accueillis sans précipitation. Avant le tawaf, il a rappelé le sens de l’intention, les gestes
          essentiels et les erreurs à éviter. Pour la première fois depuis le départ, ils ne se sentaient plus seuls.
        </p>
        <h2>Une Omra comprise, pas seulement effectuée</h2>
        <p>
          À chaque étape, ils pouvaient poser leurs questions. Pourquoi ce geste ? À quel moment faire cette invocation ?
          Comment garder son cœur présent malgré la fatigue ? Le guide n’a pas remplacé leur spiritualité ; il l’a aidée
          à respirer.
        </p>
        <h2>Le retour</h2>
        <p>
          Ils sont repartis avec des souvenirs, mais surtout avec une compréhension plus profonde. C’est cette différence
          que SAFARUMA veut offrir : ne pas seulement faire la Omra, mais la vivre pleinement.
        </p>
      </section>
    </main>
  );
}
