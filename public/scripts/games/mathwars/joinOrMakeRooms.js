var socket = io();

let username = document.getElementById("username");
let btnGenUsername = document.getElementById("genUsername");
let roomCode = document.getElementById("roomCode");
let joinRoom = document.getElementById("joinRoom");
let btnJoin = document.getElementById("btnJoin");
let makeRoom = document.getElementById("makeRoom");
let btnMake = document.getElementById("btnMake");

let publicRoomsList = document.getElementById("publicRoomsList");

window.onload = function() {
  let urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has("join")) {
    roomCode.value = urlParams.get("join");
    username.focus();
  }

  if (sessionStorage.getItem("mathwars_kicked") == "true") {
    sessionStorage.removeItem("mathwars_kicked");
    Swal.fire({
      title: "You were kicked by the host!",
      text: "If you think this is a mistake, please contact them.",
      icon: "error",
      iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
      background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
      color: themeSettings.contentTextColor[localStorage.getItem("theme")]
    });
  }

  socket.emit("mathwars_loadPublicRooms");
}

socket.on("mathwars_displayPublicRooms", function(roomList) {
  roomList.forEach(room => {
    let roomDiv = document.createElement("div");
    let joinBtn = document.createElement("button");
    
    roomDiv.textContent += room.name + " ";
    roomDiv.classList.add("secondaryContentTheme");
    roomDiv.appendChild(joinBtn);
    
    
    joinBtn.textContent = "Join";
    joinBtn.classList.add("contentTheme");
    
    joinBtn.addEventListener("click", function() {
      let username = document.getElementById("username").value || randomUsername();
      socket.emit("mathwars_joinRoom", username, room.roomCode);
      joinBtn.disabled = true;
    });
    
    publicRoomsList.appendChild(roomDiv);
  });
});

btnGenUsername.addEventListener("click", function() {
  username.value = randomUsername(); //random adjective + random animal
});

joinRoom.addEventListener("submit", function(e) {
  e.preventDefault(); //prevent page from reloading

  let username = document.getElementById("username").value || randomUsername();
  socket.emit("mathwars_joinRoom", username, roomCode.value);

  btnJoin.disabled = true;
});

makeRoom.addEventListener("submit", function(e) {
  e.preventDefault(); //prevent page from reloading
  let privacy = document.querySelector('input[name="privacy"]:checked').value;
  let username = document.getElementById("username").value || randomUsername();

  socket.emit("mathwars_makeRoom", username, privacy);

  btnMake.disabled = true;
});

socket.on("mathwars_redirectToRoomPage", (id, roomCode) => {
  sessionStorage.setItem("mathwars_userId", id);
  window.location.href = "/mathwars/" + roomCode;
});

//general error alert:
socket.on("error", (errorTitle, errorMessage) => {
  Swal.fire({
    title: errorTitle,
    text: errorMessage,
    icon: "error",
    iconColor: themeSettings.contentTextColor[localStorage.getItem("theme")],
    background: themeSettings.contentBackgroundColor[localStorage.getItem("theme")],
    color: themeSettings.contentTextColor[localStorage.getItem("theme")]
  });

  btnJoin.disabled = false;
});

function randomUsername() {
  //credit for animals list: https://gist.github.com/lexicalbits/883f1867985208797be75a873d006bef
  let animalNames = ["Cat","Cattle","Dog","Donkey","Goat","Horse","Pig","Rabbit","Aardvark","Aardwolf","Albatross","Alligator","Alpaca","Amphibian","Anaconda","Angelfish","Anglerfish","Ant","Anteater","Antelope","Antlion","Ape","Aphid","Armadillo","Asp","Baboon","Badger","Bandicoot","Barnacle","Barracuda","Basilisk","Bass","Bat","Bear","Beaver","Bedbug","Bee","Beetle","Bird","Bison","Blackbird","Boa","Boar","Bobcat","Bobolink","Bonobo","Booby","Bovid","Bug","Butterfly","Buzzard","Camel","Canid","Capybara","Cardinal","Caribou","Carp","Cat","Catshark","Caterpillar","Catfish","Cattle","Centipede","Cephalopod","Chameleon","Cheetah","Chickadee","Chicken","Chimpanzee","Chinchilla","Chipmunk","Clam","Clownfish","Cobra","Cockroach","Cod","Condor","Constrictor","Coral","Cougar","Cow","Coyote","Crab","Crane","Crawdad","Crayfish","Cricket","Crocodile","Crow","Cuckoo","Cicada","Damselfly","Deer","Dingo","Dinosaur","Dog","Dolphin","Donkey","Dormouse","Dove","Dragonfly","Dragon","Duck","Eagle","Earthworm","Earwig","Echidna","Eel","Egret","Elephant","Elk","Emu","Ermine","Falcon","Ferret","Finch","Firefly","Fish","Flamingo","Flea","Fly","Flyingfish","Fowl","Fox","Frog","Gamefowl","Galliform","Gazelle","Gecko","Gerbil","Gibbon","Giraffe","Goat","Goldfish","Goose","Gopher","Gorilla","Grasshopper","Grouse","Guan","Guanaco","Guineafowl","Gull","Guppy","Haddock","Halibut","Hamster","Hare","Harrier","Hawk","Hedgehog","Heron","Herring","Hippopotamus","Hookworm","Hornet","Horse","Hoverfly","Hummingbird","Hyena","Iguana","Impala","Jackal","Jaguar","Jay","Jellyfish","Junglefowl","Kangaroo","Kingfisher","Kite","Kiwi","Koala","Koi","Krill","Ladybug","Lamprey","Landfowl","Lark","Leech","Lemming","Lemur","Leopard","Leopon","Limpet","Lion","Lizard","Llama","Lobster","Locust","Loon","Louse","Lungfish","Lynx","Macaw","Mackerel","Magpie","Mammal","Manatee","Mandrill","Marlin","Marmoset","Marmot","Marsupial","Marten","Mastodon","Meadowlark","Meerkat","Mink","Minnow","Mite","Mockingbird","Mole","Mollusk","Mongoose","Monkey","Moose","Mosquito","Moth","Mouse","Mule","Muskox","Narwhal","Newt","Nightingale","Ocelot","Octopus","Opossum","Orangutan","Orca","Ostrich","Otter","Owl","Ox","Panda","Panther","Parakeet","Parrot","Parrotfish","Partridge","Peacock","Peafowl","Pelican","Penguin","Perch","Pheasant","Pig","Pigeon","Pike","Pinniped","Piranha","Planarian","Platypus","Pony","Porcupine","Porpoise","Possum","Prawn","Primate","Ptarmigan","Puffin","Puma","Python","Quail","Quelea","Quokka","Rabbit","Raccoon","Rat","Rattlesnake","Raven","Reindeer","Reptile","Rhinoceros","Roadrunner","Rodent","Rook","Rooster","Roundworm","Sailfish","Salamander","Salmon","Sawfish","Scallop","Scorpion","Seahorse","Shark","Sheep","Shrew","Shrimp","Silkworm","Silverfish","Skink","Skunk","Sloth","Slug","Smelt","Snail","Snake","Snipe","Sole","Sparrow","Spider","Spoonbill","Squid","Squirrel","Starfish","Stingray","Stoat","Stork","Sturgeon","Swallow","Swan","Swift","Swordfish","Swordtail","Tahr","Takin","Tapir","Tarantula","Tarsier","Termite","Tern","Thrush","Tick","Tiger","Tiglon","Toad","Tortoise","Toucan","Trout","Tuna","Turkey","Turtle","Tyrannosaurus","Urial","Vicuna","Viper","Vole","Vulture","Wallaby","Walrus","Wasp","Warbler","Weasel","Whale","Whippet","Whitefish","Wildcat","Wildebeest","Wildfowl","Wolf","Wolverine","Wombat","Woodpecker","Worm","Wren","Xerinae","Yak","Zebra","Alpaca","Cat","Cattle","Chicken","Dog","Donkey","Ferret","Gayal","Goldfish","Guppy","Horse","Koi","Llama","Sheep","Yak"];
  //credit for adjectives list: https://github.com/rgbkrk/adjectives/blob/master/index.js
  let adjectives = ["Aback","Abaft","Abandoned","Abashed","Aberrant","Abhorrent","Abiding","Abject","Ablaze","Able","Abnormal","Aboriginal","Abortive","Abounding","Abrasive","Abrupt","Absent","Absorbed","Absorbing","Abstracted","Absurd","Abundant","Abusive","Acceptable","Accessible","Accidental","Accurate","Acid","Acidic","Acoustic","Acrid","Adamant","Adaptable","Addicted","Adhesive","Adjoining","Adorable","Adventurous","Afraid","Aggressive","Agonizing","Agreeable","Ahead","Ajar","Alert","Alike","Alive","Alleged","Alluring","Aloof","Amazing","Ambiguous","Ambitious","Amuck","Amused","Amusing","Ancient","Angry","Animated","Annoyed","Annoying","Anxious","Apathetic","Aquatic","Aromatic","Arrogant","Ashamed","Aspiring","Assorted","Astonishing","Attractive","Auspicious","Automatic","Available","Average","Aware","Awesome","Axiomatic","Bad","Barbarous","Bashful","Bawdy","Beautiful","Befitting","Belligerent","Beneficial","Bent","Berserk","Bewildered","Big","Billowy","Bitter","Bizarre","Black","Bloody","Blue","Blushing","Boiling","Boorish","Bored","Boring","Bouncy","Boundless","Brainy","Brash","Brave","Brawny","Breakable","Breezy","Brief","Bright","Broad","Broken","Brown","Bumpy","Burly","Bustling","Busy","Cagey","Calculating","Callous","Calm","Capable","Capricious","Careful","Careless","Caring","Cautious","Ceaseless","Certain","Changeable","Charming","Cheap","Cheerful","Chemical","Chief","Childlike","Chilly","Chivalrous","Chubby","Chunky","Clammy","Classy","Clean","Clear","Clever","Cloistered","Cloudy","Closed","Clumsy","Cluttered","Coherent","Cold","Colorful","Colossal","Combative","Comfortable","Common","Complete","Complex","Concerned","Condemned","Confused","Conscious","Cooing","Cool","Cooperative","Coordinated","Courageous","Cowardly","Crabby","Craven","Crazy","Creepy","Crooked","Crowded","Cruel","Cuddly","Cultured","Cumbersome","Curious","Curly","Curved","Curvy","Cut","Cute","Cynical","Daffy","Daily","Damaged","Damaging","Damp","Dangerous","Dapper","Dark","Dashing","Dazzling","Dead","Deadpan","Deafening","Dear","Debonair","Decisive","Decorous","Deep","Deeply","Defeated","Defective","Defiant","Delicate","Delicious","Delightful","Demonic","Delirious","Dependent","Depressed","Deranged","Descriptive","Deserted","Detailed","Determined","Devilish","Didactic","Different","Difficult","Diligent","Direful","Dirty","Disagreeable","Disastrous","Discreet","Disgusted","Disgusting","Disillusioned","Dispensable","Distinct","Disturbed","Divergent","Dizzy","Domineering","Doubtful","Drab","Draconian","Dramatic","Dreary","Drunk","Dry","Dull","Dusty","Dynamic","Dysfunctional","Eager","Early","Earsplitting","Earthy","Easy","Eatable","Economic","Educated","Efficacious","Efficient","Elastic","Elated","Elderly","Electric","Elegant","Elfin","Elite","Embarrassed","Eminent","Empty","Enchanted","Enchanting","Encouraging","Endurable","Energetic","Enormous","Entertaining","Enthusiastic","Envious","Equable","Equal","Erect","Erratic","Ethereal","Evanescent","Evasive","Even","Excellent","Excited","Exciting","Exclusive","Exotic","Expensive","Exuberant","Exultant","Fabulous","Faded","Faint","Fair","Faithful","Fallacious","False","Familiar","Famous","Fanatical","Fancy","Fantastic","Far","Fascinated","Fast","Fat","Faulty","Fearful","Fearless","Feeble","Feigned","Female","Fertile","Festive","Few","Fierce","Filthy","Fine","Finicky","First","Fixed","Flagrant","Flaky","Flashy","Flat","Flawless","Flimsy","Flippant","Flowery","Fluffy","Fluttering","Foamy","Foolish","Foregoing","Forgetful","Fortunate","Frail","Fragile","Frantic","Free","Freezing","Frequent","Fresh","Fretful","Friendly","Frightened","Frightening","Full","Fumbling","Functional","Funny","Furry","Furtive","Future","Futuristic","Fuzzy","Gabby","Gainful","Gamy","Gaping","Garrulous","Gaudy","General","Gentle","Giant","Giddy","Gifted","Gigantic","Glamorous","Gleaming","Glib","Glistening","Glorious","Glossy","Godly","Good","Goofy","Gorgeous","Graceful","Grandiose","Grateful","Gratis","Gray","Greasy","Great","Greedy","Green","Grey","Grieving","Groovy","Grotesque","Grouchy","Grubby","Gruesome","Grumpy","Guarded","Guiltless","Gullible","Gusty","Guttural","Habitual","Half","Hallowed","Halting","Handsome","Handy","Hanging","Hapless","Happy","Hard","Harmonious","Harsh","Hateful","Heady","Healthy","Heartbreaking","Heavenly","Heavy","Hellish","Helpful","Helpless","Hesitant","Hideous","High","Highfalutin","Hilarious","Hissing","Historical","Holistic","Hollow","Homeless","Homely","Honorable","Horrible","Hospitable","Hot","Huge","Hulking","Humdrum","Humorous","Hungry","Hurried","Hurt","Hushed","Husky","Hypnotic","Hysterical","Icky","Icy","Idiotic","Ignorant","Ill","Illegal","Illustrious","Imaginary","Immense","Imminent","Impartial","Imperfect","Impolite","Important","Imported","Impossible","Incandescent","Incompetent","Inconclusive","Industrious","Incredible","Inexpensive","Infamous","Innate","Innocent","Inquisitive","Insidious","Instinctive","Intelligent","Interesting","Internal","Invincible","Irate","Irritating","Itchy","Jaded","Jagged","Jazzy","Jealous","Jittery","Jobless","Jolly","Joyous","Judicious","Juicy","Jumbled","Jumpy","Juvenile","Keen","Kind","Kindhearted","Kindly","Knotty","Knowing","Knowledgeable","Known","Labored","Lackadaisical","Lacking","Lame","Lamentable","Languid","Large","Last","Late","Laughable","Lavish","Lazy","Lean","Learned","Left","Legal","Lethal","Level","Lewd","Light","Like","Likeable","Limping","Literate","Little","Lively","Living","Lonely","Long","Longing","Loose","Lopsided","Loud","Loutish","Lovely","Loving","Low","Lowly","Lucky","Ludicrous","Lumpy","Lush","Luxuriant","Lying","Lyrical","Macabre","Macho","Maddening","Madly","Magenta","Magical","Magnificent","Majestic","Makeshift","Male","Malicious","Mammoth","Maniacal","Many","Marked","Massive","Married","Marvelous","Material","Materialistic","Mature","Mean","Measly","Meaty","Medical","Meek","Mellow","Melodic","Melted","Merciful","Mere","Messy","Mighty","Military","Milky","Mindless","Miniature","Minor","Miscreant","Misty","Mixed","Moaning","Modern","Moldy","Momentous","Motionless","Mountainous","Muddled","Mundane","Murky","Mushy","Mute","Mysterious","Naive","Nappy","Narrow","Nasty","Natural","Naughty","Nauseating","Near","Neat","Nebulous","Necessary","Needless","Needy","Neighborly","Nervous","New","Next","Nice","Nifty","Nimble","Nippy","Noiseless","Noisy","Nonchalant","Nondescript","Nonstop","Normal","Nostalgic","Nosy","Noxious","Numberless","Numerous","Nutritious","Nutty","Oafish","Obedient","Obeisant","Obese","Obnoxious","Obscene","Obsequious","Observant","Obsolete","Obtainable","Oceanic","Odd","Offbeat","Old","Omniscient","Onerous","Open","Opposite","Optimal","Orange","Ordinary","Organic","Ossified","Outgoing","Outrageous","Outstanding","Oval","Overconfident","Overjoyed","Overrated","Overt","Overwrought","Painful","Painstaking","Pale","Paltry","Panicky","Panoramic","Parallel","Parched","Parsimonious","Past","Pastoral","Pathetic","Peaceful","Penitent","Perfect","Periodic","Permissible","Perpetual","Petite","Phobic","Physical","Picayune","Pink","Piquant","Placid","Plain","Plant","Plastic","Plausible","Pleasant","Plucky","Pointless","Poised","Polite","Political","Poor","Possessive","Possible","Powerful","Precious","Premium","Present","Pretty","Previous","Pricey","Prickly","Private","Probable","Productive","Profuse","Protective","Proud","Psychedelic","Psychotic","Public","Puffy","Pumped","Puny","Purple","Purring","Pushy","Puzzled","Puzzling","Quaint","Quarrelsome","Questionable","Quick","Quiet","Quirky","Quixotic","Quizzical","Rabid","Racial","Ragged","Rainy","Rambunctious","Rampant","Rapid","Rare","Raspy","Ratty","Ready","Real","Rebel","Receptive","Recondite","Red","Redundant","Reflective","Regular","Relieved","Remarkable","Reminiscent","Repulsive","Resolute","Resonant","Responsible","Rhetorical","Rich","Right","Righteous","Rightful","Rigid","Ripe","Ritzy","Roasted","Robust","Romantic","Roomy","Rotten","Rough","Round","Royal","Ruddy","Rude","Rural","Rustic","Ruthless","Sable","Sad","Safe","Salty","Same","Sassy","Satisfying","Savory","Scandalous","Scarce","Scared","Scary","Scattered","Scientific","Scintillating","Scrawny","Screeching","Second","Secret","Secretive","Sedate","Seemly","Selective","Selfish","Separate","Serious","Shaggy","Shaky","Shallow","Sharp","Shiny","Shivering","Shocking","Short","Shrill","Shut","Shy","Sick","Silent","Silky","Silly","Simple","Simplistic","Sincere","Skillful","Skinny","Sleepy","Slim","Slimy","Slippery","Sloppy","Slow","Small","Smart","Smelly","Smiling","Smoggy","Smooth","Sneaky","Snobbish","Snotty","Soft","Soggy","Solid","Somber","Sophisticated","Sordid","Sore","Sour","Sparkling","Special","Spectacular","Spicy","Spiffy","Spiky","Spiritual","Spiteful","Splendid","Spooky","Spotless","Spotted","Spotty","Spurious","Squalid","Square","Squealing","Squeamish","Staking","Stale","Standing","Statuesque","Steadfast","Steady","Steep","Stereotyped","Sticky","Stiff","Stimulating","Stingy","Stormy","Straight","Strange","Striped","Strong","Stupendous","Sturdy","Subdued","Subsequent","Substantial","Successful","Succinct","Sudden","Sulky","Super","Superb","Superficial","Supreme","Swanky","Sweet","Sweltering","Swift","Symptomatic","Synonymous","Taboo","Tacit","Tacky","Talented","Tall","Tame","Tan","Tangible","Tangy","Tart","Tasteful","Tasteless","Tasty","Tawdry","Tearful","Tedious","Teeny","Telling","Temporary","Ten","Tender","Tense","Tenuous","Terrific","Tested","Testy","Thankful","Therapeutic","Thick","Thin","Thinkable","Third","Thirsty","Thoughtful","Thoughtless","Threatening","Thundering","Tidy","Tight","Tightfisted","Tiny","Tired","Tiresome","Toothsome","Torpid","Tough","Towering","Tranquil","Trashy","Tremendous","Tricky","Trite","Troubled","Truculent","True","Truthful","Typical","Ubiquitous","Ultra","Unable","Unaccountable","Unadvised","Unarmed","Unbecoming","Unbiased","Uncovered","Understood","Undesirable","Unequal","Unequaled","Uneven","Unhealthy","Uninterested","Unique","Unkempt","Unknown","Unnatural","Unruly","Unsightly","Unsuitable","Untidy","Unused","Unusual","Unwieldy","Unwritten","Upbeat","Uppity","Upset","Uptight","Used","Useful","Useless","Utopian","Vacuous","Vagabond","Vague","Valuable","Various","Vast","Vengeful","Venomous","Verdant","Versed","Victorious","Vigorous","Violent","Violet","Vivacious","Voiceless","Volatile","Voracious","Vulgar","Wacky","Waggish","Waiting","Wakeful","Wandering","Wanting","Warlike","Warm","Wary","Wasteful","Watery","Weak","Wealthy","Weary","Wet","Whimsical","Whispering","White","Whole","Wholesale","Wicked","Wide","Wiggly","Wild","Willing","Windy","Wiry","Wise","Wistful","Witty","Woebegone","Womanly","Wonderful","Wooden","Woozy","Workable","Worried","Worthless","Wrathful","Wretched","Wrong","Wry","Yellow","Yielding","Young","Youthful","Yummy","Zany","Zealous","Zesty","Zippy","Zonked"];

  return adjectives[Math.floor(Math.random()*adjectives.length)] + animalNames[Math.floor(Math.random()*animalNames.length)];
}

document.getElementById("displayRooms").onclick = function() {
  socket.emit("mathwars_logRooms");
}