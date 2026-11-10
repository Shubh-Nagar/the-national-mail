/**
 * Sample content for The National Mail.
 *
 * All people, villages and organisations in these stories are fictional.
 * They exist so the site looks complete on first run; delete or edit them
 * from the admin panel before launch.
 *
 * `scripts/build-seed-sql.js` turns this file into database/seed.sql.
 */

export const categories = [
  { name: 'Changemakers', slug: 'changemakers', color: '#B4232A', description: 'People quietly fixing problems in their own neighbourhoods.' },
  { name: 'Environment', slug: 'environment', color: '#2F6B4F', description: 'Water, forests, waste and climate, told through the people working on them.' },
  { name: 'Innovation', slug: 'innovation', color: '#2E5AAC', description: 'Frugal engineering and homegrown ideas that solve real problems.' },
  { name: 'Rural India', slug: 'rural-india', color: '#8C5A33', description: 'Farms, villages and the economies that keep them going.' },
  { name: 'Culture & Heritage', slug: 'culture-heritage', color: '#8E3B5E', description: 'Crafts, monuments, food and the people keeping traditions alive.' },
  { name: 'Health', slug: 'health', color: '#1F7A7A', description: 'Care that reaches people where they live.' },
  { name: 'Education', slug: 'education', color: '#B06A10', description: 'Classrooms, libraries and second chances.' },
  { name: 'Travel', slug: 'travel', color: '#3D5A80', description: 'Places worth the journey, and the communities that host you.' },
];

export const authors = [
  { name: 'Aditi Rao', slug: 'aditi-rao', designation: 'Senior Correspondent', bio: 'Aditi reports on grassroots changemakers across central and eastern India. She has spent a decade travelling by train to stories most people never hear about.' },
  { name: 'Kabir Sethi', slug: 'kabir-sethi', designation: 'Environment Editor', bio: 'Kabir covers water, forests and climate adaptation. He is happiest knee-deep in a restored wetland with a notebook.' },
  { name: 'Meera Pillai', slug: 'meera-pillai', designation: 'Features Writer', bio: 'Meera writes about culture, food and the crafts that are quietly being rescued by a new generation.' },
  { name: 'Arjun Deshmukh', slug: 'arjun-deshmukh', designation: 'Innovation Reporter', bio: 'Arjun tracks frugal engineering, small-town startups and the tinkerers who build what they cannot buy.' },
];

const p = (...paras) => paras.map((t) => (t.startsWith('<') ? t : `<p>${t}</p>`)).join('\n');

export const articles = [
  {
    title: 'A retired postman in Odisha has delivered 4,000 library books by bicycle',
    excerpt: 'After 34 years on the same route, Bhagaban Mallick swapped letters for library books. His canvas bag now carries novels, textbooks and newspapers to eleven villages.',
    category: 'changemakers', author: 'aditi-rao', image: 'postman-library',
    caption: 'Bhagaban covers roughly 40 km a day on the same route he walked as a postman.',
    tags: ['libraries', 'reading', 'odisha', 'senior citizens'],
    featured: true, editorsPick: true, views: 18420, hoursAgo: 3,
    gallery: [['gallery-1', 'The lending register Bhagaban keeps in a school notebook.'], ['gallery-3', 'The road to Kantapada, the farthest village on his route.']],
    content: p(
      'Every morning at seven, Bhagaban Mallick ties a canvas bag to the carrier of his bicycle and checks the register one more time. Thirty-one books today. Four are overdue, and he already knows which doorsteps to stop at first.',
      'For 34 years, Bhagaban delivered letters on this same route through the villages around Kantapada. When he retired in 2021, he found that he could not stop. "People still waited for me at the gate," he says. "Only now, nobody was writing letters."',
      '<h2>From letters to libraries</h2>',
      'He began with 60 books from his own shelf and a few donated by the school where his daughter teaches. Within a year, word had spread. Teachers, retired officers and a bookshop in Cuttack began sending cartons. Today his lending library has a little over 1,200 titles and a waiting list for the Odia translation of a popular detective series.',
      '<blockquote><p>A letter used to bring news from far away. A book does the same thing, only it lasts longer.</p></blockquote>',
      'Borrowing is free. The only rule is that every book must come back in the condition it left. Children who return books on time get to choose first from the new carton, a privilege that has done more for punctuality than any fine.',
      '<h2>What the numbers say</h2>',
      'Bhagaban has logged 4,000 deliveries in a set of school notebooks. The most borrowed category is not fiction but exam guides, which he now buys with small contributions from parents. Teachers at the local high school say reading scores have quietly improved, though nobody has studied it formally.',
      'He has no plans to stop. "My knees will tell me when," he laughs, and pedals off towards the next village.'
    ),
  },
  {
    title: 'How a Kutch village turned a dry lake into a year-round water bank',
    excerpt: 'Desilting, a ring of check dams and a strict village rulebook brought back a lake that had been dry for most of the last two decades.',
    category: 'environment', author: 'kabir-sethi', image: 'kutch-lake',
    caption: 'The restored lake held water through the summer for the first time in 19 years.',
    tags: ['water conservation', 'gujarat', 'community'],
    featured: true, views: 12950, hoursAgo: 7,
    content: p(
      'For most of the last twenty years, the lake at the edge of Navagam was a cracked bowl of clay that filled for a few weeks after the monsoon and vanished by Diwali. Women walked three kilometres for drinking water. Young men left for the salt pans.',
      'In 2022, the village council decided to try something old. With the help of a local water collective, residents mapped the catchment on foot, identified seven blocked inlet channels and spent two dry seasons removing 18,000 tractor loads of silt.',
      '<h2>A rulebook written by the village</h2>',
      'Restoring the lake was only half the work. The gram sabha agreed on rules that every household signed: no borewells within 500 metres of the shore, no pumping for irrigation after February, and a rotating committee to guard the inlets during the rains.',
      '<blockquote><p>We did not build anything new. We only undid the damage and agreed to share.</p></blockquote>',
      'The silt itself became an asset. Farmers spread it on their fields, and several report better yields of cumin and castor. This summer, the lake held water until the monsoon arrived for the first time in 19 years.',
      'Neighbouring villages have started visiting with notebooks. The council has a simple answer for all of them: start with the map, not the machines.'
    ),
  },
  {
    title: 'Two Pune engineers built a ₹900 sensor that tells farmers exactly when to irrigate',
    excerpt: 'A soil-moisture probe made from off-the-shelf parts sends a single SMS when a field needs water, and farmers using it report using about a third less.',
    category: 'innovation', author: 'arjun-deshmukh', image: 'soil-sensor',
    caption: 'The probe sits 30 cm deep and sends one message a day.',
    tags: ['agritech', 'frugal innovation', 'maharashtra', 'water conservation'],
    featured: true, editorsPick: true, views: 9870, hoursAgo: 11,
    content: p(
      'Shreya Kulkarni and Rohan Bhide met in a college robotics club and kept tinkering long after graduation. Their latest project is a sensor the size of a pen, powered by a coin cell, that does one thing: it tells a farmer when the soil at root depth is actually dry.',
      '"Most farmers irrigate by calendar or by looking at the topsoil," Shreya explains. "The top two inches dry fast. The roots are often still fine."',
      '<h2>Deliberately simple</h2>',
      'There is no app and no dashboard. When moisture drops below a threshold set for the crop, the farmer gets one SMS in Marathi. The device costs ₹900 to make and runs for a full season on its battery.',
      'In a pilot across 120 farms near Baramati, growers using the sensor pumped about 30 percent less water with no drop in yield. Electricity bills fell too, a detail farmers mentioned far more often than water.',
      '<blockquote><p>We kept removing features until it was something a busy farmer would never have to think about.</p></blockquote>',
      'The pair have open-sourced the hardware design and are working with two farmer producer organisations to manufacture the next 5,000 units locally.'
    ),
  },
  {
    title: 'The last bell-metal craftsmen of an Assam village are training their daughters',
    excerpt: 'For generations the craft passed only from father to son. With fewer sons staying, master artisans are rewriting the rule.',
    category: 'culture-heritage', author: 'meera-pillai', image: 'bell-metal',
    caption: 'A workshop in lower Assam, where bell-metal plates are still hammered by hand.',
    tags: ['crafts', 'assam', 'women'],
    featured: true, views: 7420, hoursAgo: 20,
    content: p(
      'The sound reaches you before the workshop does: a steady, ringing rhythm of hammers on hot bell metal. Inside, Jonali Das, 22, is shaping a plate that will take her three days to finish.',
      'Until recently, she would not have been allowed to touch the hammer. In her village, the craft of making kanh, the traditional bell-metal utensils of Assam, was passed down only from father to son.',
      '<h2>A rule that no longer worked</h2>',
      'Her father, Haren Das, has worked metal for 41 years. Both his sons now work in Guwahati. "I had two choices," he says. "Let the craft end with me, or teach whoever wanted to learn."',
      'Today eleven young women train in four family workshops. They have also brought something new: an Instagram page, custom engraving and a waiting list of buyers from Bengaluru and Pune.',
      '<blockquote><p>The metal does not know who is holding the hammer.</p></blockquote>',
      'Prices for a hand-hammered plate have risen by almost half in two years, enough that two of the brothers are thinking about coming home.'
    ),
  },
  {
    title: 'Inside the night school where Bengaluru’s delivery riders learn English',
    excerpt: 'Between the dinner rush and the late-night orders, riders gather in a borrowed classroom for ninety minutes of conversation practice.',
    category: 'education', author: 'aditi-rao', image: 'night-school',
    caption: 'Classes begin at 10:30 pm, after the dinner peak.',
    tags: ['adult education', 'bengaluru', 'gig workers'],
    views: 6210, hoursAgo: 26,
    content: p(
      'At 10:30 pm, a classroom in a government school in Koramangala fills with helmets. Twenty-six delivery riders take their seats, phones face down, for ninety minutes of English conversation.',
      'The night school was started by Farhan Qureshi, a former rider who now manages a fleet. "Customers would complain, and riders could not explain what happened," he says. "Not because they were wrong. Because they did not have the words."',
      '<h2>Lessons built from real conversations</h2>',
      'The syllabus is practical: explaining a delay, asking for directions, handling a wrong address, negotiating with a building guard. Volunteers from nearby offices teach in pairs, and every lesson ends with role play.',
      'Riders say ratings have improved, but the bigger change is confidence. Several have used their new skills in interviews for warehouse supervisor and customer-support roles.',
      '<blockquote><p>The first thing I learned to say was "please wait two minutes". Now I can explain anything.</p></blockquote>',
      'The school runs on donated tea and borrowed chalk. A second batch starts in Indiranagar next month.'
    ),
  },
  {
    title: 'A Mizoram homestay that runs entirely on rainwater and sunshine',
    excerpt: 'Five rooms, a 40,000-litre rain tank and a rooftop solar array: how one family built a guesthouse that has never needed the grid.',
    category: 'travel', author: 'meera-pillai', image: 'mizoram-homestay',
    caption: 'The homestay sits on a ridge an hour from Aizawl.',
    tags: ['sustainable travel', 'mizoram', 'solar'],
    views: 5480, hoursAgo: 33,
    content: p(
      'The road to Lalrinpuii’s homestay ends in a bamboo gate and a view that stretches across three ridges. Her family opened five rooms to travellers in 2020, with one condition: the guesthouse would never draw from the grid or the village spring.',
      'Every roof slopes towards a 40,000-litre underground tank. A rooftop solar array and a battery bank power lights, fans and a water heater. Food comes from the family’s own terraced garden and neighbours’ farms.',
      '<h2>Guests become part of the routine</h2>',
      'Visitors are asked to take bucket baths during dry months and to switch off lights during cloudy spells. Almost nobody complains. Several return guests now arrive with seeds from their own gardens.',
      'The homestay employs four young people from the village and buys from fourteen households. Lalrinpuii says the business model is simple: "Spend less on things, and more on people."'
    ),
  },
  {
    title: 'This doctor couple runs a free eye camp every Sunday in tribal Jharkhand',
    excerpt: 'In nine years, Dr Nandini and Dr Prakash Murmu have screened more than 60,000 people and arranged over 7,000 cataract surgeries.',
    category: 'health', author: 'aditi-rao', image: 'eye-camp',
    caption: 'Patients begin queuing before sunrise outside the village school.',
    tags: ['healthcare', 'jharkhand', 'volunteering'],
    editorsPick: true, views: 8830, hoursAgo: 40,
    content: p(
      'By six on a Sunday morning, the queue outside the primary school already curves around the playground. Some patients have walked from villages twelve kilometres away.',
      'Inside, Dr Nandini Murmu and her husband Dr Prakash Murmu set up an eye-testing station on two school desks. They have done this almost every Sunday for nine years.',
      '<h2>Cataract is the biggest enemy</h2>',
      'Most patients have cataracts that went untreated for years, slowly turning daily work into guesswork. The couple screen, prescribe glasses on the spot and book surgeries at a partner hospital in Ranchi, with free transport both ways.',
      '<blockquote><p>When a grandmother can see her grandchild’s face again, she does not say thank you. She just holds your hand.</p></blockquote>',
      'They have trained 22 local health workers to do basic vision screening, so the camp can now focus on people who need a doctor most.'
    ),
  },
  {
    title: 'The seed library keeping 300 heirloom rice varieties alive',
    excerpt: 'Farmers borrow a kilo of seed and return two after harvest. A simple rule has saved varieties that had nearly disappeared.',
    category: 'rural-india', author: 'kabir-sethi', image: 'seed-library',
    caption: 'Seeds are stored in clay pots sealed with neem leaves.',
    tags: ['agriculture', 'biodiversity', 'west bengal'],
    views: 4310, hoursAgo: 52,
    content: p(
      'In a mud-walled room in a village in West Bengal, 312 clay pots line the shelves. Each holds a different variety of rice, some with names that only a handful of elderly farmers still remember.',
      'The seed library works like any other: farmers borrow a kilo and return two after harvest. The extra seed goes to the next borrower.',
      '<h2>Flavour, resilience and memory</h2>',
      'Several varieties tolerate salt water or flooding better than modern hybrids, which has made them newly valuable after recent cyclones. Others are prized for aroma or for the festival dishes they are traditionally used in.',
      'Young farmers now record every variety’s behaviour in a shared notebook: days to harvest, height, yield and taste. It is slowly becoming a field guide that no laboratory could have written.'
    ),
  },
  {
    title: 'Students in Nagaland built a bus shelter from 12,000 plastic bottles',
    excerpt: 'A class project turned into a village landmark, and a plan to clear plastic from the river that runs below the school.',
    category: 'environment', author: 'kabir-sethi', image: 'plastic-shelter',
    caption: 'Each eco-brick is a bottle packed tight with soft plastic waste.',
    tags: ['plastic waste', 'nagaland', 'students'],
    views: 3920, hoursAgo: 60,
    content: p(
      'It started as a Class 9 science project on plastic pollution. Six months later, the students of a government school in Nagaland had collected 12,000 bottles from the riverbank and packed each one tight with chip packets and wrappers.',
      'The resulting eco-bricks, set in mud mortar and plastered with lime, now form a bus shelter at the village junction. It has survived two monsoons.',
      'The students have since mapped every plastic hotspot along a two-kilometre stretch of the river and run a monthly clean-up with the village youth club.'
    ),
  },
  {
    title: 'An app built in Indore turns railway announcements into text for deaf passengers',
    excerpt: 'Listening to platform speakers in real time, the free app shows train numbers, platform changes and delays as large, clear text.',
    category: 'innovation', author: 'arjun-deshmukh', image: 'railway-app',
    caption: 'The app works offline once a station’s audio model is downloaded.',
    tags: ['accessibility', 'indore', 'apps', 'railways'],
    featured: true, views: 11240, hoursAgo: 14,
    content: p(
      'Platform announcements are a lifeline for most passengers and a wall of noise for people who are deaf or hard of hearing. Tanvi Jain, a final-year computer science student in Indore, grew up watching her cousin miss train after train because of a last-minute platform change.',
      'Her app listens through the phone’s microphone, recognises announcements in Hindi and English, and shows the key details in large text: train number, platform, expected time.',
      '<h2>Tested on the platforms it was built for</h2>',
      'Tanvi and two classmates spent months recording announcements at Indore Junction to train the recognition model on real platform acoustics, echoes and all. The app now works offline and supports 14 major stations.',
      '<blockquote><p>It should not take a stranger’s kindness to know which platform your train is on.</p></blockquote>',
      'More than 20,000 people have downloaded it. The team is working with a deaf community organisation to add Indian Sign Language video for the most common announcements.'
    ),
  },
  {
    title: 'Meet the women running Madhya Pradesh’s first all-women solar repair cooperative',
    excerpt: 'Forty women who once could not get a technician to visit now fix solar pumps, lights and inverters across 60 villages.',
    category: 'changemakers', author: 'aditi-rao', image: 'solar-cooperative',
    caption: 'Members carry a standard toolkit and a logbook for every repair.',
    tags: ['women', 'solar', 'madhya pradesh', 'livelihoods'],
    editorsPick: true, views: 7650, hoursAgo: 72,
    content: p(
      'When a solar pump broke in their village, it used to stay broken for weeks. Technicians came from the district town, if they came at all. So in 2023, a self-help group of women in Madhya Pradesh asked a simple question: why can’t we fix it ourselves?',
      'Today their cooperative has 40 trained members who repair solar pumps, home lighting systems and inverters across 60 villages. They charge a fixed fee per visit and keep a shared stock of spare parts.',
      '<h2>Skills that pay</h2>',
      'Most members earn between ₹6,000 and ₹11,000 a month, often more than their husbands earn from farming in a dry season. Two members now train new technicians for a state rural livelihoods programme.',
      '<blockquote><p>People used to ask where the technician was. Now they ask for me by name.</p></blockquote>'
    ),
  },
  {
    title: 'Why one Kerala beach town has almost no plastic on its shore',
    excerpt: 'A deposit on every bottle, fishermen paid to bring back plastic from the sea, and a town that decided not to wait for a rule.',
    category: 'environment', author: 'kabir-sethi', image: 'kerala-beach',
    caption: 'Fishing boats now return with nets of plastic as well as fish.',
    tags: ['plastic waste', 'kerala', 'fishermen'],
    views: 5120, hoursAgo: 90,
    content: p(
      'Walk the beach at dawn in this small fishing town in Kerala and you will find footprints, crab holes and very little else. Five years ago, plastic washed up in drifts.',
      'The change came from the fishing community. The panchayat now pays boats a small fee for every kilo of plastic they bring back from sea, and shops charge a ₹5 deposit on every bottle sold, refunded on return.',
      'Collected plastic is shredded at a unit run by a women’s collective and sold to a road-building contractor. The town has turned waste into a small but steady source of income.'
    ),
  },
  {
    title: 'Volunteers restored a 400-year-old stepwell in Rajasthan. Now it is full again',
    excerpt: 'Two years of weekend work by 300 volunteers cleared tonnes of debris and brought water back to a forgotten baori.',
    category: 'culture-heritage', author: 'meera-pillai', image: 'stepwell',
    caption: 'The stepwell’s geometry is visible again after decades under debris.',
    tags: ['heritage', 'rajasthan', 'water conservation', 'volunteering'],
    featured: true, views: 10380, hoursAgo: 30,
    video: { type: 'embed', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
    gallery: [['gallery-2', 'Volunteers cleared the steps by hand, one landing at a time.']],
    content: p(
      'For decades, the stepwell at the edge of the old town was a dumping ground. Its carved steps disappeared under rubble, plastic and silt. Most residents under forty did not know it existed.',
      'In 2023, a group of college students started clearing it on weekends. Two years and 300 volunteers later, the baori’s eleven levels are visible again, and after a good monsoon it holds water to the sixth step.',
      '<h2>Heritage that works</h2>',
      'Stepwells were built to store rainwater through dry months. Once cleared, this one began recharging nearby wells, and families who had relied on tankers report that their handpumps are running again.',
      '<blockquote><p>We came to save a monument. We ended up saving water.</p></blockquote>',
      'The volunteers have written a short guide on safe desilting and are helping three other towns map their own forgotten stepwells.'
    ),
  },
  {
    title: 'A grandmother’s pickle recipes became a 40-woman enterprise in the hills',
    excerpt: 'What began as jars sold to tourists is now a brand that ships across India, and keeps young women in their villages.',
    category: 'rural-india', author: 'meera-pillai', image: 'pickle-enterprise',
    caption: 'Pickles are sun-cured on rooftops for up to three weeks.',
    tags: ['women', 'livelihoods', 'uttarakhand', 'food'],
    views: 6890, hoursAgo: 110,
    content: p(
      'Kamla Devi has made the same lingad fern pickle every spring for fifty years. When her granddaughter Pooja started selling a few jars to trekkers in 2019, neither of them imagined that the recipes would one day employ forty women.',
      'Their enterprise now makes eighteen pickles and chutneys from hill produce, all sun-cured and sold online. Every recipe is credited to the woman who brought it.',
      'The best part, Pooja says, is that young women no longer have to choose between earning a living and staying home. Several have turned down offers to move to the plains.'
    ),
  },
  {
    title: 'Fishermen in the Sundarbans are planting mangroves to protect their own homes',
    excerpt: 'After two cyclones in three years, a fishing community has planted 2 lakh mangrove saplings along its most exposed embankments.',
    category: 'environment', author: 'kabir-sethi', image: 'mangrove',
    caption: 'Saplings are raised in community nurseries before planting at low tide.',
    tags: ['mangroves', 'climate', 'west bengal', 'community'],
    views: 4760, hoursAgo: 130,
    video: { type: 'upload', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
    content: p(
      'The embankment behind Sabita Mondal’s house broke twice in three years. Each time, salt water ruined her family’s fields and pond. This time, the village did not wait for a new concrete wall.',
      'Over two years, families have planted roughly 2 lakh mangrove saplings along the most exposed stretches. Women run the nurseries; fishermen plant at low tide.',
      'Mangrove roots trap silt and soften waves. Older plantations nearby have already shown how much damage they can absorb, and the community hopes its young forest will do the same within a few years.'
    ),
  },
  {
    title: 'In Ladakh, solar greenhouses are bringing fresh vegetables to winter tables',
    excerpt: 'Walls of mud brick and a sloped polythene roof keep temperatures above freezing, even at minus 20°C outside.',
    category: 'innovation', author: 'arjun-deshmukh', image: 'ladakh-greenhouse',
    caption: 'A greenhouse uses thick mud walls to store the day’s heat.',
    tags: ['agriculture', 'ladakh', 'solar', 'frugal innovation'],
    views: 3640, hoursAgo: 150, status: 'draft',
    content: p(
      'Winter in Ladakh used to mean months of potatoes, dried vegetables and expensive produce trucked in before the passes close. Passive solar greenhouses are changing that.',
      'Thick mud-brick walls on three sides soak up heat during the day and release it at night. A sloped polythene roof faces south. Inside, spinach, coriander and turnips grow through January.',
      'This article is a draft in the sample data, so you can see how unpublished work appears in the admin panel.'
    ),
  },
];
