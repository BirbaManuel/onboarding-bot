# Partie 1

Dans le but de simplifier la relation avec les Truskers, Trusk
souhaite faciliter leur onboarding à travers le chat bot qu'ils
utilisent déjà à ce jour pour la saisie des courses.

Le but de l'exercice est de permettre la saisie de leurs informations
de profil à travers un outil en ligne de commande.

Les informations à saisir sont:

- Le nom du trusker
- Le nom de la société
- Le nombre d'employés
- Pour chaque employé son nom
- Le nombre de camion
- Pour chaque camion le volume en m³ du camion
- Le type de camion

Chaque champs doit saisir une information valide, si l'information est
invalide ou vide la question doit être posée à nouveau. (pas le droit
d'utiliser le validate d'inquirer, on doit reposer la question tant
que la réponse est invalide, comme un vrai chat bot)

À la fin de la saisie des informations, on les affiche et on prompt à
nouveau "Les informations sont elles valides?" si non on recommence au
début.

## Partie 2

On stocke les réponses dans redis. Si on coupe le tool au milieu de
l'onboarding et qu'on le relance, les réponses précédentes sont
affichées et le tool saute automatiquement à la prochaine question. A
la fin le redis est vidé.

Technos à utiliser:

- NodeJS
- https://www.npmjs.com/package/inquirer
- async/await
- ES6 Promise https://www.npmjs.com/package/bluebird
- https://www.npmjs.com/package/redis

Le but est de voir à quel point tu es à l'aise avec la promise chain
et avec l'interaction avec un BDD
boucle for, while proscrite (on fait du fonctionnel chez trusk!)
N'hésite pas à me poser des questions si tu en as :)
Tu peux me rendre les 2 parties en 2 temps
Bon courage!

## Pour lancer un serveur redis avec Docker

```
docker run -p 6379:6379 --name redis -d redis redis-server --appendonly yes
```

### Partie 3

La problématique est la suivante:
Trusk vend des courses à ses clients, et les rachète à ses truskers
(livreurs), sous forme de "deals".
Les truskers choisissent entre des "deals" (groupes de courses) qui
leurs sont proposées au même moment, parfois groupées (de à 1 à 3
courses).
ex:
trusker 1 => demande des deals => deal proposé (2 courses) [Course A, Course B]
trusker 2 => demande des deals => deal proposé (1 course) [Course B]
trusker 3 => demande des deals => deal proposé (2 courses) [Course A, Course C]
trusker 4 => demande des deals => deal proposé (3 courses) [Course C,
Course D, Course E]

Les services de l'infra sont:

- service d'affectation: contient les "deals" présentés aux truskers
- service de disponibilités: contient les dispos par trusker (5 max par jour)
- service de courses: contient toutes les courses, et peut enregistrer
  un trusker affecté sur chacune d'entre elles

Chacun a une base de donnée dédiée, les interfaces de communication
entre eux restent à déterminer.

Le trusker interagit avec l'API d'un service d'affectation, qui
enregistre les deals (contient les foreign keys des courses et du
trusker qui l'a accepté une fois disponible).

- si un trusker accepte un deal, il doit être affecté à toutes les
  courses du deal (service de courses), ou aucune si l'une d'être elles
  est déjà prise.
- lorsque le trusker accepte un deal, le service d'affectation doit
  d'abord interroger le service de disponibilités pour s'avoir si le
  trusker peut prendre la(es) course(s) (max 5 par jour), puis affecter
  le trusker sur la(es) course(s) (en interrogeant le service de
  course).
- si le trusker réussit à saisir un deal, le service de disponibilités
  doit décompter de ses disponibilités le nombre de courses du groupe.

Problématiques techniques rencontrées:

- le trusker n'a plus qu'1 disponibilité et a réussi à accepter 2
  courses à intervale très rapproché => il a dépensé 2 fois sa dernière
  dispo et se retrouve avec 6 courses
- l'une des courses du groupe que le trusker veut accepter a déjà été
  prise et il ne se retrouve qu'avec 1 course sur les 2, la 2ème
  affectation ayant échouée
- l'une des courses du groupe que le trusker veut accepter à déjà été
  prise, mais les disponibilités on été décomptées: il sera bloqué à 4
  courses maximum sur la journée au lieu de 5
- le même deal a été accepté par 2 truskers en même temps et le
  trusker 1 est enregistré sur le deal, mais c'est les trusker 2 qui est
  affecté sur les courses du deal.

Proposer une solution pour répondre aux problématiques architecturales
rencontrées qui permettrait de conserver la cohérence de l'état de
chacun des services.
On attend sous forme rédigée:

- une présentation de l'architecture choisie pour le service de
  dispatch et les interactions entre les différents services
- une présentation des technologies utilisées en expliquant ce
  qu'elles résolvent
- une description de la segmentation du projet en plus petites étapes
  livrables si besoin

Bon courage!
