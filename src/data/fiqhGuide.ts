import { FiqhGuideItem } from '../types';

export const FIQH_GUIDE_ITEMS: FiqhGuideItem[] = [
  {
    id: 'distance-safar',
    title: 'Distance minimale de voyage (Masâfat al-Qasr)',
    category: 'distance',
    badge: 'Critère de base',
    summary: 'Le statut de voyageur s\'applique généralement à partir d\'environ 80 à 85 km.',
    content: `Selon la majorité des juristes (Chaféite, Malékite, Hanbalite), la distance minimale pour bénéficier des dispenses de voyage (Rukhsah) est de 4 Burd (environ 80 à 85 km) en quittant l'agglomération de sa ville de résidence. 
Pour l'école Hanafite, le critère traditionnel correspond à 3 jours de marche de caravane (évalué à ~77-88 km). Dès que cette distance est dépassée et que l'on quitte les habitations de sa ville, les facilités de prière sont légiférées.`,
    hadithOrDalil: "« Allah aime que l'on use de Ses dispenses (Rukhas) comme Il déteste que l'on commette Ses interdits. » (Hadith rapporté par Ahmad et Ibn Hibban)",
  },
  {
    id: 'qasr-shortening',
    title: 'Le Raccourcissement (Qasr) : 4 rak\'ahs réduites à 2',
    category: 'qasr',
    badge: 'Allègement',
    summary: 'Dhuhr, Asr et Isha passent de 4 unités à 2 unités. Fajr (2) et Maghrib (3) restent inchangées.',
    content: `Le voyageur prie deux unités de prière (rak'atayn) au lieu de quatre pour Dhuhr, Asr et Isha.
- Fajr reste 2 rak'ahs.
- Maghrib reste 3 rak'ahs.
- Les prières surérogatoires (Sunan Rawâtib) régulières peuvent être allégées, à l'exception de la sounnah de l'aube (Fajr) et de la prière impaire (Witr) que le Prophète ﷺ maintenait même en voyage.
Attention : Si vous priez derrière un imam résident (qui n'est pas voyageur), vous devez obligatoirement prier 4 rak'ahs complètes avec lui.`,
    hadithOrDalil: "« Et quand vous parcourez la terre, ce n'est pas un péché pour vous de raccourcir la prière. » (Coran, Sourate An-Nisa 4:101)",
  },
  {
    id: 'jam-combining',
    title: 'Le Regroupement des prières (Al-Jam\')',
    category: 'jam',
    badge: 'Flexibilité des horaires',
    summary: 'Possibilité d\'associer Dhuhr + Asr, et Maghrib + Isha, soit par anticipation (Taqdim) soit par report (Ta\'khir).',
    content: `En voyage, le musulman peut regrouper :
1. Dhuhr et Asr ensemble (au moment de Dhuhr = Jam' Taqdim, ou au moment d'Asr = Jam' Ta'khir).
2. Maghrib et Isha ensemble (au moment de Maghrib = Jam' Taqdim, ou au moment d'Isha = Jam' Ta'khir).
Fajr ne se regroupe avec aucune autre prière.

Pratique recommandée selon les transports :
- Avion / Train : Si votre vol décolle avant Dhuhr et atterrit pendant l'Asr, vous ferez Jam' Ta'khir à l'arrivée. Si vous êtes à l'aéroport pendant Dhuhr avant d'embarquer pour un vol qui couvrira l'Asr, faites Jam' Taqdim (Dhuhr 2 rak'ahs puis Asr 2 rak'ahs) dans la salle de prière du terminal.
- Voiture : Vous pouvez rouler pendant le temps de Dhuhr et vous arrêter au moment de l'Asr pour regrouper les deux, ou inversement vous arrêter à midi faire les deux avant de reprendre l'autoroute.`,
    hadithOrDalil: "D'après Ibn Abbas (qu'Allah l'agrée) : « Le Messager d'Allah ﷺ regroupait Dhuhr et Asr lorsqu'il était en voyage, ainsi que Maghrib et Isha. » (Al-Bukhari)",
  },
  {
    id: 'prayer-plane',
    title: 'Prière en Avion (Vol en altitude)',
    category: 'onboard',
    badge: 'Transports aériens',
    summary: 'Prier debout si possible ou assis à son siège avec gestes si impossibilité absolue.',
    content: `1. Trouver le bon moment : Les horaires en altitude changent avec la vitesse et les fuseaux horaires (le soleil se couche ou se lève plus vite). Vérifiez la lumière du ciel par le hublot si possible ou fiez-vous au calculateur d'itinéraire.
2. Ablutions : Préparez une petite bouteille d'eau ou lingette humide. En cas d'impossibilité d'utiliser l'eau, le Tayammum (pierre/sol naturel) est permis.
3. Position :
- Si l'avion dispose d'un espace libre à l'arrière ou d'une zone dédiée (comme sur Emirates, Saudia, Qatar, Turkish) et que l'équipage l'autorise sans danger de turbulence : priez debout face à la Qibla.
- Si le couloir est étroit ou le signal des ceintures est allumé, priez assis à votre siège : inclinez-vous légèrement pour le Ruku', et un peu plus bas pour le Sujud.`,
    hadithOrDalil: "« Priez debout ; si vous ne le pouvez pas, alors assis ; et si vous ne le pouvez pas, alors sur le côté. » (Al-Bukhari)",
  },
  {
    id: 'prayer-train-boat',
    title: 'Prière en Train et Bateau',
    category: 'onboard',
    badge: 'Rail & Maritime',
    summary: 'La prière sur un bateau ou un train en mouvement est permise avec adaptation continue de la Qibla.',
    content: `Sur un bateau / ferry :
- Le Prophète ﷺ a été interrogé sur la prière en bateau et a répondu : « Prie debout, sauf si tu crains de te noyer (ou d'avoir le vertige par la houle). »
- Déterminez la Qibla au départ. Si le bateau change de cap pendant la prière, tournez-vous autant que possible vers la nouvelle direction.

Dans le train (TGV, Eurostar, etc.) :
- Si le trajet dure moins de 2 à 3 heures, il est souvent préférable de faire Jam' Taqdim avant le départ en gare ou Jam' Ta'khir à l'arrivée.
- Si le voyage est très long (train de nuit / transcontinental) et que le temps de la prière risque d'expirer : cherchez une plateforme calme entre les wagons ou priez assis à votre place avec révérence.`,
    hadithOrDalil: "Rapporté d'Ibn Umar : Le Prophète ﷺ a prié sur son monture dans la direction où elle allait par gestes. (Sahih Muslim)",
  },
  {
    id: 'prayer-car',
    title: 'Prière en Voiture & Trajets routiers',
    category: 'onboard',
    badge: 'Autoroute & Véhicule',
    summary: 'Pour la prière obligatoire, il est impératif d\'arrêter le véhicule et de prier au sol.',
    content: `À la différence des prières surérogatoires (Nawâfil), les prières obligatoires (Fard) ne peuvent PAS être faites au volant en conduisant !
Il faut stationner sur une aire de repos sécurisée (aire de service autoroutière).
- Astuce de route : Beaucoup d'aires disposent d'espaces verts propres où l'on peut poser un tapis de voyage, ou de salles de repos.
- Des mosquées de village existent souvent à moins de 5 minutes des sorties d'autoroute. Notre planificateur vous indique les arrêts idéaux pour combiner essence, café et prière sereine.`,
    hadithOrDalil: "Le Prophète ﷺ descendait de sa monture pour accomplir la prière obligatoire au sol. (Al-Bukhari)",
  },
  {
    id: 'wudu-tayammum',
    title: 'Ablutions (Wouddou) et Tayammum en voyage',
    category: 'wudu',
    badge: 'Purification',
    summary: 'Facilitations pour l\'essuyage des chaussettes (Khuffayn) pendant 3 jours et 3 nuits.',
    content: `1. Essuyage sur les chaussettes/chaussures (Al-Mash 'ala al-Khuffayn) :
Le voyageur a le droit d'essuyer avec les mains humides le dessus de ses chaussettes enfilées en état de pureté pendant **72 heures (3 jours et 3 nuits)**, sans avoir besoin de laver ses pieds à chaque fois. Cela facilite énormément les ablutions dans les toilettes exiguës d'aéroports ou de trains.
2. Économie d'eau : Une demi-bouteille d'eau de 33cl suffit amplement selon la Sunnah pour un Wudu complet.
3. Le Tayammum (lustration pulvérulente) : Si l'eau est absente ou si son utilisation nuit à la santé ou est strictement interdite (ex: toilettes d'avion bouchées), passez les mains sur une pierre propre ou de la poussière naturelle, essuyez le visage et les mains jusqu'aux poignets.`,
    hadithOrDalil: "« Le Prophète ﷺ a fixé pour le voyageur trois jours et leurs nuits pour l'essuyage sur les chaussettes. » (Sahih Muslim)",
  },
  {
    id: 'qibla-finding',
    title: 'Orientation vers la Qibla en déplacement',
    category: 'qibla',
    badge: 'Direction de La Mecque',
    summary: 'Efforcez-vous de déterminer la direction de la Kaaba au début de la prière.',
    content: `Avant de débuter votre prière :
1. Utilisez la boussole intégrée dans l'application avec le relèvement précis en degrés vers la Kaaba.
2. Si vous êtes dans un moyen de transport qui tourne constamment (avion en virage, ferry en manœuvre), orientez-vous vers la Qibla lors du Takbir d'ouverture (Allahu Akbar). Si le véhicule tourne ensuite de façon imprévisible et que vous ne pouvez plus vous réorienter, votre prière reste valide selon la parole d'Allah : « À Allah seul appartiennent l'Est et l'Ouest. Où que vous vous tourniez, la Face d'Allah est là. » (Coran 2:115).`,
    hadithOrDalil: "« Où que vous soyez, tournez vos visages vers la Mosquée Sacrée. » (Coran, Al-Baqarah 2:144)",
  },
];

export const TRAVEL_DUAS = [
  {
    id: 'dua-safar-main',
    title: 'Dou\'a principal du départ en voyage (Invocation de la monture)',
    arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ ، وَإِنَّا إِلَىٰ رَبِّنَا لَمُنْقَلِبُونَ . اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَٰذَا الْبِرَّ وَالتَّقْوَىٰ ، وَمِنَ الْعَمَلِ مَا تَرْضَىٰ ، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَٰذَا وَاطْوِ عَنَّا بُعْدَهُ ، اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ ، وَالْخَلِيفَةُ فِي الْأَهْلِ',
    transliteration: "Subhâna-lladhî sakh-khara lanâ hâdhâ wa mâ kunnâ lahû muqrinîn, wa innâ ilâ Rabbinâ la-munqalibûn. Allâhumma innâ nas'aluka fî safarinâ hâdhâ al-birra wat-taqwâ, wa mina-l-'amali mâ tardâ. Allâhumma hawwin 'alaynâ safaranâ hâdhâ watwi 'annâ bu'dah. Allâhumma Antas-Sâhibu fis-safar, wal-Khalîfatu fil-ahl.",
    translation: "Gloire à Celui qui a mis ceci à notre service alors que nous n'étions pas capables de les dompter. Et c'est vers notre Seigneur que nous retournerons. Ô Allah, nous Te demandons dans ce voyage la piété, la droiture et les actions qui Te satisfont. Ô Allah, facilite-nous ce voyage et raccourcis-en la distance. Ô Allah, Tu es le Compagnon de route et le Gardien de notre famille.",
    source: "Sahih Muslim (Hadith n° 1342)",
  },
  {
    id: 'dua-takbir-tasbih',
    title: 'Pendant le voyage : Montées et descentes (Avion au décollage / Collines)',
    arabic: 'اللهُ أَكْبَرُ عِنْدَ الصُّعُودِ ، وَسُبْحَانَ اللهِ عِنْدَ النُّزُولِ',
    transliteration: "Allâhu Akbar lors des montées / décollages, et Subhânallâh lors des descentes / atterrissages.",
    translation: "D'après Jabir ibn Abdillah : « Lorsque nous montions en altitude (sur une colline, ou en phase ascensionnelle), nous disions : Allahu Akbar. Et lorsque nous descendions, nous disions : Subhanallah. »",
    source: "Sahih Al-Bukhari (n° 2993)",
  },
  {
    id: 'dua-town-entry',
    title: 'Invocation en entrant dans une nouvelle ville d\'escale',
    arabic: 'اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَمَا أَظْلَلْنَ ، وَرَبَّ الْأَرَضِينَ السَّبْعِ وَمَا أَقْلَلْنَ... أَسْأَلُكَ خَيْرَ هَٰذِهِ الْقَرْيَةِ وَخَيْرَ أَهْلِهَا وَخَيْرَ مَا فِيهَا',
    transliteration: "Allâhumma Rabba-s-samawâtis-sab'i wa mâ azlaln, wa Rabbal-ardînas-sab'i wa mâ aqlaln... As'aluka khayra hâdhihil-qaryah wa khayra ahlihâ wa khayra mâ fîhâ.",
    translation: "Ô Allah, Seigneur des sept cieux et de ce qu'ils ombragent, Seigneur des sept terres et de ce qu'elles portent... Je Te demande le bien de cette cité, le bien de ses habitants et le bien de ce qu'elle renferme.",
    source: "Rapporté par An-Nasa'i et Al-Hakim",
  },
];
