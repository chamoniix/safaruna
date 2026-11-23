# DocuSeal pour les contrats guides SAFARUMA

Référence de travail vérifiée le 23 novembre 2026. Lire ce fichier avant de reprendre l’intégration, puis charger le skill officiel et la référence de l’opération concernée. Ce document distingue les décisions du propriétaire, les capacités DocuSeal et l’état réel de l’implémentation. Une capacité documentée n’est pas une fonctionnalité déjà livrée sur SAFARUMA.

## Sources et skills enregistrés

- Dépôt officiel : https://github.com/docusealco/docuseal-agent-skills
- Plugin installé : `docuseal@docuseal-agent-skills`, distribution `1.0.0`.
- `docuseal-code`, version `1.0.7`, pour SDK, API, intégration React, JWT et webhooks.
- `docuseal-cli`, version `1.0.8`, pour les commandes du terminal. Toujours le charger avant une commande `docuseal`.
- Commit de la copie installée : `cd32f55842fe18799810e18350b6bbf6b316c1be`.
- Les skills et le SDK JavaScript sont sous licence MIT. Cela ne rend pas l’API de production gratuite ; la plateforme auto-hébergée DocuSeal possède sa propre licence.

Sur ce poste, le skill de développement est dans `/Users/chamoonix/.codex/skills/docuseal-code/SKILL.md`. Les deux skills du plugin sont dans `/Users/chamoonix/.codex/plugins/cache/docuseal-agent-skills/docuseal/1.0.0/skills/`. Ces chemins sont propres au poste ; utiliser le catalogue des skills si le cache change.

Une copie complète des **86 fichiers Markdown**, avec les exemples et les références pour tous les langages fournis, est sauvegardée dans `.context/docuseal-official-skills/skills/`. La licence, le README officiel, un inventaire avec SHA-256 et un index sont conservés à côté :

- [Index local complet](.context/docuseal-official-skills/INDEX.md)
- [Versions et empreintes](.context/docuseal-official-skills/manifest.json)
- [Skill développement sauvegardé](.context/docuseal-official-skills/skills/docuseal-code/SKILL.md)
- [Skill CLI sauvegardé](.context/docuseal-official-skills/skills/docuseal-cli/SKILL.md)

`.context` est ignoré par Git : cette copie reste dans le workspace, elle n’est pas publiée par un commit. Le présent fichier et son renvoi dans `AGENTS.md` permettent de retrouver les règles et les chemins lors d’une prochaine session. Ne pas prétendre que toutes les références sont automatiquement réinjectées dans le contexte.

La relecture couvre les deux skills, les instructions et paramètres de leurs références API/CLI/embed, avec les exemples nécessaires à TypeScript, aux champs de contrat et à la vérification des signatures. Les variantes répétées dans les autres langages restent disponibles intégralement dans la copie officielle ; recharger la référence complète avant d’utiliser un exemple.

## Console et accès constatés

- Console globale : https://console.docuseal.com/api
- Console test : https://console.docuseal.com/test/api
- Le 23 novembre, la console connectée affichait `/api`. Le contrôle « Test mode » était décoché et son lien pointait vers `/test/api` : **l’écran observé est hors mode test**.
- La clé enregistrée localement a été acceptée par un appel en lecture seule à `GET /templates`, y compris avec le SDK officiel.
- La réponse de cette opération ne contient aucun indicateur de mode. Un HTTP 200 ne prouve ni le mode de la clé, ni un abonnement Pro, ni l’autorisation d’une opération de création. L’écran observé et le mode exact de la clé ne sont pas deux preuves interchangeables. Ne pas lire ou révéler les champs secrets du navigateur pour tenter une comparaison.
- Modèle Guide FR créé le 23 novembre après accord explicite du propriétaire : `7108668`, détaillé ci-dessous. Aucune demande de signature, invitation ou configuration de webhook n’a été créée.

Pour la console, le navigateur Gstack de ce workspace utilise `BROWSE_PORT=34568`, `BROWSE_SESSION=docuseal-setup`, `BROWSE_PARENT_PID=0` et `--headed`. Ne pas arrêter ou remplacer le navigateur du port 34567, qui appartient à un autre projet. Se limiter aux onglets DocuSeal autorisés, sans lire les clés, cookies ou stockages du navigateur.

## Règles du propriétaire pour les guides

1. Le contrat est entre le Guide et **HOLDINGAI LTD**, société n° 16382871. Aucun nom personnel du propriétaire n’y figure. Un seul signataire est prévu dans les brouillons : le Guide ; aucune signature de société ne doit être inventée ou apposée automatiquement.
2. Le contrat est en français. Une version anglaise sera préparée ultérieurement.
3. Droit anglais et tribunaux d’Angleterre et du Pays de Galles, conformément à l’instruction du propriétaire et aux CGU existantes.
4. La Charte SAFARUMA complète est annexée et son respect figure dans le contrat.
5. Le virement est envoyé **trois jours ouvrés après la date de fin de la prestation du Guide**. Les jours comptabilisés sont lundi à vendredi ; samedi et dimanche sont exclus. Le calcul utilise la date, sans heure de fin à renseigner. La prestation doit être déclarée terminée par le Guide. La réception dépend ensuite de sa banque.
6. SAFARUMA encaisse 100 % du paiement client. Les reversements sont gérés manuellement après prestation. La répartition interne 15 % SAFARUMA / 85 % guides ne doit pas être ajoutée aux contrats ou exposée au client par défaut.
7. L’autorisation de photo dans les brouillons concerne uniquement le portrait sur la fiche publique du Guide sur safaruma.com. Aucun usage publicitaire ou sur les réseaux sociaux n’a été autorisé par cette clause.
8. Signature, vérification du dossier, validation bancaire et publication sont des opérations distinctes. Une signature seule ne publie pas un profil.

Ne pas ajouter de pénalité, d’exclusivité supplémentaire, de vérification d’identité payante, de paiement DocuSeal, de publication automatique ou d’abonnement sans instruction du propriétaire.

## Objets et cycle de signature

| Objet | Fonction | Identifiant à conserver pour le futur raccordement |
|---|---|---|
| Template | Modèle, documents, rôles et champs | `template_id`, version du contrat et éventuellement `external_id` |
| Submission | Demande de signature créée à partir des documents | `submission_id` |
| Submitter | Signataire individuel et ses champs | `submitter_id`, `external_id` et rattachement au Guide |
| Document | PDF partiel ou signé | Référence distante et/ou fichier privé, pas une URL temporaire comme référence durable |

Cycle technique : préparer le modèle et les champs → créer une submission avec le Guide → transmettre son lien de signature → confirmer le statut côté serveur → récupérer les documents signés et la trace d’audit. Ce parcours est maintenant raccordé localement dans la fiche Guide du backoffice, avec préparation sans email puis envoi distinct. Le suivi se fait par une actualisation explicite auprès de l’API ; aucun webhook n’est configuré.

**Effets importants de l’API :**

- `send_email` vaut **true par défaut** à la création. Pour une préparation sans invitation, le passer explicitement à `false`, à la racine et pour le signataire. Passer aussi `send_sms: false`.
- Une submission créée sans email reste un objet distant avec un lien de signature utilisable. Ce n’est pas un brouillon inactif au sens de DocuSign. Ne pas réutiliser le paramètre DocuSign `status: created`.
- `completed: true` marque un signataire comme complété et peut signer pour lui. Ne jamais l’utiliser pour préparer le contrat d’un Guide ou simuler son consentement.
- L’ordre `preserved` séquence les signataires ; `random` permet une signature sans cet ordre. Le contrat Guide actuel n’a qu’un signataire.
- `/d/{slug}` est le lien partagé d’un modèle ; `/s/{slug}` correspond à un signataire créé par API. Ces liens permettent d’accéder aux documents : ne pas les publier dans les logs ou une page publique.
- `external_id` sert au rattachement à une ressource interne ; il ne remplace pas les contrôles d’accès.

## API et SDK

Source : [API officielle](https://www.docuseal.com/docs/api).

| Hébergement | Base API | Composants embarqués |
|---|---|---|
| Global, utilisé ici | `https://api.docuseal.com` | `https://cdn.docuseal.com` |
| Cloud UE | `https://api.docuseal.eu` | `https://cdn.docuseal.eu`, attribut `host` requis |
| Auto-hébergement | `https://instance.example/api` | Même hôte que l’instance, `host` requis |

Authentification REST : **`X-Auth-Token`**, pas `Authorization: Bearer`. Préférer le SDK officiel lorsque le langage en dispose. SAFARUMA utilise `@docuseal/api` **1.0.25**, version verrouillée dans `package.json` et `package-lock.json`.

Le client existant est dans [src/lib/docuseal.ts](src/lib/docuseal.ts), protégé par `server-only`. `getDocusealClient()` lit `process.env.DOCUSEAL_API_KEY` et utilise actuellement l’hôte global. `createGuideContractDraft()` valide l’entrée, prend un modèle explicitement fourni, prépare un seul rôle `Guide` et désactive email/SMS. Il préremplit le nom et l’email, ainsi que la ville et l’adresse lorsqu’elles sont fournies ; il peut associer un `external_id`. Il ne préremplit ni autorisation photo, ni signature, ni date. Il n’expose aucune route HTTP et ne change aucun profil ou revenu.

Le raccordement serveur préparé après le second « ok go » comprend également :

- `readVerifiedGuideContract()` relit l’API et contrôle la submission, le modèle, le signataire unique de rôle `Guide`, l’email et l’identifiant externe attendus. La route construit cette référence depuis la persistance autorisée, jamais depuis des identifiants DocuSeal libres fournis par le navigateur.
- `sendGuideContractInvitation()` est une opération distincte : elle demande uniquement l’email, jamais de SMS ou de signature automatique. Elle refuse un contrat expiré, archivé, décliné ou terminé et ne renvoie pas d’invitation après un `sent_at` déjà confirmé. Les claims persistants du service métier protègent les envois concurrents ; un résultat réseau incertain requiert une réconciliation, jamais un renvoi automatique. Ne pas annoncer une garantie d’envoi exactement une fois du fournisseur.
- `readSignedGuideContractDocument()` exige le statut complet et les dates de complétion de la submission et du Guide. Il récupère une URL fraîche du PDF final ou de l’audit, réservée au serveur. La route contrôle l’accès et transmet le fichier sans exposer l’URL temporaire.

Six tests réseau locaux avec le vrai SDK passent pour la préparation, l’identité, l’envoi distinct, le renvoi évité après confirmation, les états non envoyables et le PDF partiel refusé. Ces tests utilisent un serveur local et des données fictives : ils n’envoient aucun email et ne simulent aucune signature chez DocuSeal.

Permission explicitement confirmée par le propriétaire : **Admin et Superadmin** peuvent préparer et envoyer les contrats. Leurs comptes actifs, rôles et emails sont recontrôlés en base, avec l’authentification administrative existante. Aucune permission de première publication ou de photo publique n’a été élargie.

### Raccordement backoffice local

- Fiche existante `/admin/guides/[slug]` : ajout du composant `GuideContractPanel`, sans réorganisation des autres sections.
- Route privée `/api/admin/guides/[slug]/contract` : lecture, actions `PREPARE`, `SEND`, `SYNC` et téléchargements. Les mutations contrôlent l’origine ; les actions et téléchargements utilisent la limitation existante par administrateur.
- Service `src/lib/guide-contracts.ts` : source du nom, de l’email et de la ville dans le compte Guide ; adresse facultative à la préparation, sinon champ obligatoire à remplir dans DocuSeal avant signature. Le nom ou l’email modifié après préparation bloque l’envoi et demande une vérification, sans réécrire un contrat existant.
- Nouvelle table `GuideContract` et migration `20261123093000_guide_contracts` : identifiants DocuSeal, version, identité du destinataire, claims de création/envoi et état vérifié. Une seule préparation pour un Guide et cette version évite les doublons. Une opération interrompue avant tout appel fournisseur peut reprendre ; après un appel au résultat incertain, seul un rapprochement par `external_id` est effectué. Plusieurs résultats ou aucun résultat confirmé bloquent une nouvelle création automatique. Aucun workflow de renouvellement ou remplacement de contrat déjà envoyé n’a été ajouté.
- La réponse de statut ne contient aucun lien porteur, clé ou identifiant DocuSeal libre. Les audits conservent les références internes et les actions, sans corps de contrat ni URL de document.
- Les rafraîchissements concurrents comparent la date fournisseur avant d’écraser un état plus récent. Le téléchargement recontrôle toujours la signature auprès de DocuSeal, même si le statut local était « signé ».
- Aperçu explicitement nommé « document préparé » ; lien « contrat signé » uniquement après complétion entière vérifiée. PDF et preuve d’audit passent par la route authentifiée, avec `private, no-store`, `Vary: Cookie` et `nosniff`. Les fichiers globaux observés sont servis directement en PDF par `https://docuseal.com`, sans redirection ; les autres hôtes, ports, credentials, HTTP et redirections sont refusés.
- L’autorisation photo signée est affichée comme donnée du contrat. Elle ne publie pas de portrait et ne modifie pas les contrôles existants d’activation.

Ce code est **local, non déployé**. La migration et `DOCUSEAL_API_KEY` doivent être appliquées à l’environnement cible avant de présenter le parcours comme disponible en production. Aucun email réel n’a été envoyé pendant les tests de ce raccordement. Aucun nouvel abonnement ni stockage de PDF n’a été provisionné.

**Différence vérifiée dans le SDK installé :** `DocusealApi.createSubmission()` 1.0.25 appelle `/submissions/init` et retourne un objet contenant notamment `id` et `submitters`. Plusieurs références REST montrent encore `/submissions` avec une réponse tableau. Utiliser le SDK et ses types réellement installés ; ne pas réécrire l’appel sur une supposition. Le test réseau local [tests/docuseal.test.ts](tests/docuseal.test.ts) vérifie le comportement du SDK.

### Opérations documentées

| Besoin | API REST décrite dans les références |
|---|---|
| Lire les modèles | `GET /templates`, `GET /templates/{id}` |
| Créer un modèle | `POST /templates/docx`, `/templates/pdf`, `/templates/html` |
| Cloner ou fusionner | `POST /templates/{id}/clone`, `POST /templates/merge` |
| Modifier modèle ou documents | `PUT /templates/{id}`, `PUT /templates/{id}/documents` |
| Créer une demande | `POST /submissions` ; le SDK actuel utilise `/submissions/init` |
| Créer directement depuis un document | `POST /submissions/docx`, `/submissions/pdf`, `/submissions/html` |
| Envoi simplifié par emails | `POST /submissions/emails` ; crée des demandes, ce n’est pas une lecture |
| Lire et suivre | `GET /submissions`, `GET /submissions/{id}`, `GET /submitters`, `GET /submitters/{id}` |
| Mettre à jour une demande ou un signataire | `PUT /submissions/{id}`, `PUT /submitters/{id}` |
| Récupérer les PDF | `GET /submissions/{id}/documents` |
| Archiver | `DELETE /templates/{id}`, `DELETE /submissions/{id}` : opérations d’écriture |

Les listes utilisent une pagination par curseur : `limit`, puis `after` avec `pagination.next`. Limite habituelle documentée : 10 par défaut, 100 au maximum. Lire le schéma de l’endpoint avant de choisir un filtre. Ne pas charger les autres contrats d’un compte au-delà du besoin SAFARUMA.

Attention : créer un template avec un `external_id` déjà utilisé peut **remplacer le document d’un modèle existant**. `shared_link` est documenté comme activé par défaut à la création de modèle ; contrôler ce paramètre avant de rendre un contrat disponible. Ne pas modifier un modèle déjà utilisé pour un contrat signé sans traitement explicite de sa version.

## Préparation DOCX et champs

Les brouillons Word personnalisés sont dans `.context/contrats-guides/`, avec le manifest privé `preparation-docuseal.json`. Ils contiennent encore des repères de travail comme `[Champ DocuSeal]` et des adresses à compléter. Ces repères **ne sont pas des champs DocuSeal fonctionnels**.

Deux syntaxes officielles ont des rôles différents :

| Syntaxe | Usage |
|---|---|
| `[[guide_name]]` | Variable de contenu remplacée dans un DOCX dynamique |
| `[[if:condition]]…[[else]]…[[end]]` | Contenu conditionnel |
| `[[for:items]]…[[end]]` | Répétition, listes ou tableaux |
| `{{Signature;type=signature;role=Guide}}` | Champ de signature à remplir |
| `{{Date;type=datenow;role=Guide}}` | Date de signature remplie automatiquement, en lecture seule |
| `{{Adresse;type=text;role=Guide}}` | Champ texte du Guide |

Les propriétés de champs peuvent définir `required`, `readonly`, `format`, `width`, `height`, `title`, `description`, `condition` ou `mask`. Les formats PDF/DOCX et HTML n’utilisent pas toujours la même orthographe : `font_size` dans les tags PDF contre `font-size` dans les tags HTML. Reprendre la référence concernée.

Pour un champ devant être immuable, appliquer `readonly` **côté serveur**. Les valeurs ou restrictions passées seulement au composant navigateur ne garantissent pas leur intégrité.

Les champs HTML utilisent notamment `<text-field>`, `<signature-field>`, `<date-field>`, `<checkbox-field>` et des dimensions CSS explicites. Le rendu PDF, la bonne attribution du rôle et les champs de consentement doivent être contrôlés avant une invitation réelle. Ne pas rendre obligatoire une autorisation photo facultative sans décision du propriétaire.

### Modèle Guide français créé le 23 novembre 2026

Accord du propriétaire : « ok go », après proposition de préparer le modèle sans l’envoyer aux guides.

- Nom dans DocuSeal : **SAFARUMA Contrat Guide FR 2026 11 23**.
- `template_id` : **7108668** ; `external_id` : `safaruma-guide-fr-20261123-37b5811e-5bdd-4058-95d6-9dca1bef58bf`.
- Un document de quatre pages, contrat français avec les huit engagements de la Charte intégralement annexés.
- Un seul rôle : `Guide`. Lien partagé désactivé (`shared_link: false`).
- Source Word générique : `.context/contrats-guides/MODELE-contrat-guide-safaruma-fr.docx`. Les quatre brouillons personnalisés restent inchangés.

| Champ | Type constaté par API | Règle du modèle |
|---|---|---|
| Nom complet du Guide | `text` | Obligatoire ; une valeur répétée pages 1 et 4 |
| Email du Guide | `text` | Obligatoire ; une valeur répétée pages 1 et 4 |
| Adresse du Guide | `text` | Obligatoire |
| Ville principale | `text` | Obligatoire |
| Autorisation photo | `checkbox` | Facultative et décochée par défaut |
| Lieu de signature | `text` | Obligatoire |
| Date de signature | `date` | Automatique, lecture seule, valeur `{{date}}`, format `DD/MM/YYYY` |
| Signature du Guide | `signature` | Obligatoire ; aucune signature préremplie |

Création initiale via `createTemplateFromDocx()`, puis remplacement **uniquement du document de ce nouveau modèle inutilisé** avec `updateTemplateDocuments()`, après vérification de son identité et de l’absence de submissions. Le document final provient du PDF rendu localement avec les polices intégrées : la conversion Word distante faisait disparaître visuellement le symbole arabe de la Charte. Le PDF corrigé conserve ce symbole et les clauses sans réécriture.

Les champs viennent des tags officiels dans le DOCX. Les positions renvoyées par API sont normalisées et les pages commencent à zéro dans cette réponse. Ne pas en déduire la convention de pagination d’un autre endpoint : les types d’entrée des champs explicites décrivent une autre convention. Sur le rendu effectivement testé, `width=360` produit une largeur de 360 points sur une page PDF de 612 points ; le terme « pixels » dans la référence ne suffit pas à garantir une correspondance CSS. Vérifier le document réel.

Contrôles réussis : huit champs et dix zones, un rôle, champs sans chevauchement entre eux ni avec le texte imprimé, date automatique en lecture seule, photo facultative non précochée, aucun tag technique imprimé. Les quatre pages distantes ont été inspectées ; les pages des clauses et de la Charte sont identiques pixel par pixel au PDF local. Tous les paragraphes du contrat et de la Charte sont conservés. Aucune submission, invitation ou simulation de signature n’a été créée.

Preuves privées : `.context/docuseal-model-qa/qa-report.json`, `verification.json`, `layout-fix-metadata.json` et `remote-render-final/`. La réponse API complète contient des URL temporaires et reste dans ce répertoire privé (`0700`, réponses `0600`). Ne pas la recopier dans un fichier suivi par Git. Scripts de préparation, création et vérification dans `.context/` ; une relance de lecture ne recrée pas de modèle. L’option de remplacement est une écriture réelle et refuse un modèle ayant déjà une demande de signature.

Ce modèle distant est utilisé par le raccordement local du backoffice décrit ci-dessus. Les appels de création, envoi, suivi et téléchargement ont été testés avec des données et un fournisseur simulés, dont les états de complétion. Cela ne constitue pas une signature de test réalisée dans DocuSeal ; aucun Guide réel n’a reçu de demande.

## Signature embarquée et éditeur

Ces composants sont documentés mais **ne sont pas installés ni raccordés au front SAFARUMA** :

- React : `@docuseal/react`, composants `DocusealForm` et `DocusealBuilder`.
- JavaScript : scripts officiels `form.js` et `builder.js` ; paramètres `data-*` en kebab-case.
- React utilise les props camelCase ; Vue et Angular possèdent leurs références propres.
- Mobile : WebView ; pas de SDK mobile natif DocuSeal à supposer.

`DocusealForm` peut recevoir `src`/`embed_src` et `language="fr"`. Les rappels `onComplete`/`onDecline` servent à l’interface ; ils ne prouvent pas une signature.

Le Form Builder nécessite un JWT **HS256 signé par le serveur avec la clé API**. Le serveur doit vérifier l’utilisateur et le modèle autorisé avant de signer. Les valeurs `template_id`, `external_id`, `user_email` et `integration_email` ne doivent pas être reprises sans contrôle depuis le navigateur. Émettre un JWT à durée limitée (`exp`) et propre à la session.

L’aperçu embarqué d’un document complété nécessite aussi un JWT de prévisualisation. Ne jamais passer directement la clé API comme prop `token`. Une intégration sur une URL numérotée ne dispense pas de vérifier que le contrat appartient au Guide connecté.

Le CSS personnalisé est fourni sous forme de chaîne et non de lien vers une feuille de style. Aucun changement du design SAFARUMA ou intégration d’un éditeur public n’a été autorisé par la simple lecture de ces capacités.

## Webhooks et preuve de signature

Configuration officielle : https://console.docuseal.com/webhooks. Le secret webhook HMAC est distinct de la clé API et n’est pas encore configuré dans SAFARUMA.

| Famille | Événements décrits |
|---|---|
| Signataire | `form.viewed`, `form.started`, `form.completed`, `form.declined` |
| Demande entière | `submission.created`, `submission.completed`, `submission.expired`, `submission.archived` |
| Modèle | `template.created`, `template.updated`, `template.archived` |

`form.completed` signifie qu’un signataire a terminé ; `submission.completed` signifie que tous les signataires ont terminé. Ne pas confondre les deux si le modèle comporte plusieurs rôles.

Vérification documentée :

1. Lire le corps brut reçu, avant de le parser ou de le resérialiser.
2. Lire `X-Docuseal-Signature`, format `timestamp.signature`.
3. Recalculer HMAC-SHA256 sur `timestamp + "." + raw_body` avec le secret du webhook.
4. Comparer en temps constant, vérifier le format et la fraîcheur du timestamp ; l’exemple officiel applique une tolérance de cinq minutes.
5. Vérifier le rattachement des identifiants DocuSeal au Guide et au contrat attendus avant toute écriture métier.

Les callbacks du navigateur ne sont pas une source de vérité. Le raccordement local confirme les statuts via API. Les notifications peuvent être rejouées ; la documentation décrit des tentatives répétées pendant 48 heures pour les comptes de production. Le futur traitement webhook devra supporter les doublons sans dupliquer une action métier ; ce traitement n’existe pas encore.

Ne pas exposer un lien de signature, une clé, un JWT, un corps de contrat ou des données bancaires dans les réponses d’erreur, les traces ou le suivi public.

## PDF signés et trace d’audit

`GET /submissions/{id}/documents` peut aussi retourner des documents **partiellement remplis** tant que la demande n’est pas terminée : vérifier le statut avant de présenter un fichier comme « signé ». Le détail d’une submission contient aussi les statuts et peut fournir `audit_log_url`.

Les URL de documents retournées par API/webhooks expirent après **40 minutes par défaut** selon la référence officielle. Le service conserve les identifiants, puis demande une URL fraîche au moment d’un téléchargement. Les PDF restent chez DocuSeal et peuvent être récupérés par les administrateurs ; aucun archivage permanent dans un autre stockage n’est implémenté.

## CLI

Le skill CLI est installé dans le plugin. Le binaire `docuseal` n’était pas présent dans le PATH lors de la vérification du 23 novembre : ne pas annoncer que le CLI exécutable est installé. Le SDK TypeScript fonctionne déjà.

Le CLI utilise `DOCUSEAL_API_KEY` et, en option, `DOCUSEAL_SERVER=global`, `europe` ou une URL d’instance. `DOCUSEAL_SERVER` n’est pas le nom du paramètre `url` du SDK. Il attend tous ses paramètres, sans dialogue interactif, et produit du JSON. Les corps et tableaux se passent via `-d` et la notation entre crochets.

Exemples **en lecture seule**, après chargement sécurisé de l’environnement et installation explicitement souhaitée du binaire :

```sh
docuseal templates list --limit 10
docuseal submissions retrieve ID_SUBMISSION
docuseal submissions documents ID_SUBMISSION
```

Pour préparer sans invitation, les commandes de création requièrent `--no-send-email` et les options correspondantes des signataires. Les commandes `send-emails`, les mises à jour avec `--send-email`, `--completed`, la création de modèles et l’archivage ont des effets réels. Lire le fichier de référence avant leur emploi.

## Secrets et exploitation locale

- Clé locale : `.context/docuseal.env`, permissions `0600`, ignoré par Git.
- Saisie masquée : `python3 .context/set-docuseal-key.py` ; n’affiche pas la clé et ne la place pas dans l’historique shell.
- Ce fichier privé **n’est pas chargé automatiquement** dans le processus Next.js ou sur Vercel. `getDocusealClient()` attend la variable du processus. Aucun secret DocuSeal n’a été déployé sur Vercel par ces opérations.
- `DOCUSEAL_API_URL` dans le fichier privé sert aux scripts de vérification ; le client produit actuel utilise explicitement l’hôte global. Ne pas prétendre que l’UE ou un auto-hébergement sont déjà configurés.
- Ne pas préfixer la clé par `NEXT_PUBLIC_`, ne pas l’écrire dans ce document, les contrats, les PR ou les fichiers suivis par Git.
- Le secret HMAC webhook devra être fourni séparément lors du raccordement ; ne pas le remplacer par la clé API.

## Coûts à vérifier avant utilisation réelle

Le [tarif officiel](https://www.docuseal.com/pricing), consulté le 23 novembre 2026, indique un portail Basic gratuit limité à dix emails de demande par mois, une API sandbox gratuite et, pour l’API de production, au moins un siège Pro à 20 USD/mois plus 0,20 USD par document complété. La page applique également les frais API à Pro auto-hébergé. Recontrôler ces montants avant de souscrire ; aucun abonnement n’a été acheté par l’agent.

La présence d’une clé et la réussite d’un GET ne prouvent pas qu’une création payante est permise sur ce compte. Ne pas confondre gratuité des skills, licence du SDK et tarification du service.

## État réel et suite du travail

Déjà préparé localement : SDK serveur ; quatre contrats français avec charte ; calcul lundi–vendredi ; bouton de déclaration de fin par mission ; contrôle de cette déclaration avant enregistrement des virements pour les missions détaillées ; parcours contrat dans le backoffice. Modèle DocuSeal distant `7108668` créé et contrôlé, sans demande de signature. Migrations `20261123090000_guide_mission_completion` et `20261123093000_guide_contracts` appliquées et testées **uniquement sur PostgreSQL local jetable**, pas en production. Aucun lot de ces modifications produit n’a encore été déployé.

Validation du raccordement : suite générale 449 tests réussis et cinq groupes PostgreSQL optionnels ignorés dans cette invocation ; 16 tests ciblés réussis lors de l’exécution séparée du groupe contrats sur une vraie base PostgreSQL locale avec les deux migrations additives. Le diff Prisma après application des migrations ne détecte aucun écart avec le schéma attendu. Couverture des droits, accès révoqué, concurrence, réponses perdues, reprise avant premier appel fournisseur, données d’identité modifiées, mauvais Guide, états partiels/complets, autorisation photo refusée, hôte de téléchargement inattendu et état fournisseur plus ancien. TypeScript, build Next et lint ciblé vérifiés. Navigateur : vrai composant avec API fictive, préparation sans envoi, confirmation annulée, envoi explicite simulé, état après rechargement, liens après complétion, erreur 409 sans renvoi et largeur mobile sans débordement. Rapports privés `guide-contracts-postgres.log`, `guide-contracts-full-tests.log`, `guide-contract-browser-report.json`. Cela ne constitue pas une signature réelle chez DocuSeal.

L’outil de test `embedded-postgres@18.7.0-beta.19` ([dépôt MIT](https://github.com/leinelissen/embedded-postgres)) est installé uniquement dans `.context/contract-db-tools/`, sans modification des dépendances produit. Le runner `.context/run-contract-postgres.mjs` initialise une base neuve sur `127.0.0.1` et un port libre, applique le schéma antérieur puis les deux migrations, contrôle la dérive et exécute les tests avec de fausses identités et un fournisseur simulé. Il arrête PostgreSQL et supprime son propre répertoire de données temporaire à la fin. Aucun utilisateur système n’est créé ; aucune base existante n’est utilisée. Le runner navigateur privé est `.context/qa-guide-contracts.cjs`.

Restent ouverts avant un parcours opérationnel :

- Compléter les adresses connues ou laisser le Guide les renseigner dans le champ obligatoire lors de la signature ; le préremplissage est raccordé localement.
- Confirmer le mode de la clé réellement utilisée et les droits du compte sans révéler le secret. L’observation de la console hors mode test est enregistrée ci-dessus ; ne pas redemander sans tenir compte de cette preuve.
- Mettre en service le raccordement local après migration et configuration de l’environnement cible ; aucun envoi réel n’a été effectué.
- Si un suivi automatique par webhook est souhaité, configurer et tester son secret HMAC, les doublons, destinataires inconnus et l’ordre des événements ; le suivi actuel utilise le bouton d’actualisation.
- Aligner les anciens barèmes nets encore présentés dans le dossier Guide avec la rémunération réellement appliquée, sans exposer les pourcentages internes.
- Traiter explicitement les anciens dossiers sans mission détaillée : le code local conserve pour eux la logique historique de réservation globale terminée. Ce cas ne constitue pas une déclaration du Guide et doit être résolu avant de prétendre que la nouvelle règle s’applique partout.
- Appliquer et vérifier les migrations dans l’environnement prévu avant une mise en ligne du code qui lit les nouveaux champs.

L’accord de préparation du modèle n’autorise pas un envoi aux guides, une activation de profil, une publication de photo ou une modification d’abonnement. Aucun déploiement n’a été effectué dans ce lot. Respecter les autorisations explicites du propriétaire et présenter les éléments concrets lorsqu’une décision métier reste nécessaire.
