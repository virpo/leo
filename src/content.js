import { EXTRA_CONTENT } from "./extra-content.js";
export const LANGUAGES = ["sk", "en"];
export const CONTENT = {
  sk: {
    brand: "Leova dielňa",
    homeTitle: "Čo dnes vymyslíme?",
    hello: "Ahoj, som Leo!",
    listen: "Počúvaj Lea",
    mute: "Vypnúť hlas",
    unmute: "Zapnúť hlas",
    home: "Všetky vynálezy",
    homeButton: "Domov",
    next: "Ďalej",
    previous: "Späť",
    replay: "Ešte raz",
    done: "Hotovo",
    complete: "Výborne, vynálezca!",
    again: "Vyskúšaj ďalší",
    back: "Do dielne",
    fullscreen: "Celá obrazovka",
    exitFullscreen: "Zavrieť celú obrazovku",
    audioError: "Ťukni na Lea a skús znova.",
    helloVoice:
      "Ahoj! Ja som Leo. Rád vymýšľam nové veci. Vyber si stroj a poď sa so mnou hrať!",
    completeVoice:
      "Výborne! Už vieš, čo tento stroj rozhýbe. Ktorý vynález preskúmame teraz?",
    machines: {
      screw: {
        name: "Lietajúca skrutka",
        short: "Lietajúca\nskrutka",
        steps: [
          {
            title: "Roztoč to!",
            action: "Toč!",
            voice:
              "Chyť rúčku a otáčaj ňou. Vidíš? Spolu s rúčkou sa točí aj drevená tyč.",
            result: "Presne tak! Rúčka roztočila celú tyč.",
          },
          {
            title: "Pridaj špirálu",
            action: "Roztoč špirálu",
            voice:
              "Toto je špirála. Okolo tyče som natiahol plachtu. Roztoč ju a pozri, ako sa krúti!",
            result: "Tyč a plachta sa točia spolu. Aká veľká špirála!",
          },
          {
            title: "Rozhýb vzduch",
            action: "Rýchlejšie!",
            voice:
              "Vzduch nevidíme, ale môžeme ho rozhýbať. Roztoč špirálu. Čím rýchlejšie sa točí, tým silnejší je náš vietor!",
            result:
              "Fíha, aký vietor! Tie čiary nám ukazujú, ako sa môže hýbať vzduch.",
          },
          {
            title: "Poletí?",
            action: "Vyskúšaj to!",
            voice:
              "Toto je celý môj stroj. Chcel som na ňom vyletieť do vzduchu. Roztoč ho. Podarí sa mu vzlietnuť?",
            result:
              "Točí sa, ale neletí! Je príliš ťažký a ľudia mu nedokážu dať dosť sily. Aj odvážny nápad nás môže niečo naučiť.",
          },
        ],
      },
      cart: {
        name: "Auto na pružinu",
        short: "Auto na\npružinu",
        steps: [
          {
            title: "Roztoč koleso",
            action: "Toč kolesom",
            voice:
              "Pozri na toto koleso. Točí sa okolo tyče. Hovoríme jej os. Chyť koleso a roztoč ho!",
            result: "Koleso sa točí a os ho drží na mieste.",
          },
          {
            title: "Zúbky spolupracujú",
            action: "Toč kolieskom",
            voice:
              "Tieto kolieska majú zúbky. Zapadajú do seba. Otoč malým kolieskom. Kam sa otočí veľké?",
            result:
              "Veľké koliesko sa točí opačne. A pomalšie! Jedno koliesko poháňa druhé.",
          },
          {
            title: "Natoč pružinu",
            action: "Natoč ju!",
            voice:
              "Otáčaj kľukou. Pružina sa stáča a ukladá si energiu z tvojej ruky. Takto si pripravíme auto na jazdu.",
            result:
              "Pružina je natočená! Keď ju pustíme, rozvinie sa a roztočí kolesá.",
          },
          {
            title: "A ideme!",
            action: "Pusti auto!",
            voice:
              "Auto je pripravené. Pusť ho! Pružina sa uvoľní, roztočí kolieska a auto sa pohne.",
            result:
              "Ide to! Pružina poháňa kolieska a tie poháňajú kolesá. Auto jazdí bez koňa!",
          },
        ],
      },
      knight: {
        name: "Mechanický rytier",
        short: "Mechanický\nrytier",
        steps: [
          {
            title: "Ohni lakeť",
            action: "Ohni ruku",
            voice:
              "Skús ohnúť svoj lakeť. Táto drevená ruka má tiež kĺb. Ťukni naň a pozri, ako sa ruka ohne.",
            result: "Kĺb spája dve časti ruky a dovolí im ohýbať sa.",
          },
          {
            title: "Potiahni šnúrku",
            action: "Potiahni!",
            voice:
              "K ruke pripevníme šnúrku. Potiahni za ňu. Čo sa stane s rukou?",
            result:
              "Ruka sa zdvihla! Šnúrka preniesla tvoje potiahnutie až k ruke.",
          },
          {
            title: "Dolu znamená hore",
            action: "Potiahni dolu",
            voice:
              "Šnúrku prehodíme cez malé koliesko. Volá sa kladka. Potiahni dolu a sleduj ruku!",
            result:
              "Ťaháš dolu, ale ruka ide hore! Kladka zmenila smer potiahnutia.",
          },
          {
            title: "Ahoj, rytier!",
            action: "Zamávaj!",
            voice:
              "A tu je celý rytier! Tento model sme vymysleli podľa mojich kresieb. Otoč kľukou. Rytier ti zamáva.",
            result:
              "Ahoj! Kľuka ťahá za šnúrky, kĺby sa ohýbajú a rytier máva. Ako dávny robot!",
          },
        ],
      },
    },
  },
  en: {
    brand: "Leo’s workshop",
    homeTitle: "What shall we invent?",
    hello: "Hello, I’m Leo!",
    listen: "Listen to Leo",
    mute: "Mute Leo",
    unmute: "Let Leo speak",
    home: "All inventions",
    homeButton: "Home",
    next: "Next",
    previous: "Back",
    replay: "Again",
    done: "Done",
    complete: "Well done, inventor!",
    again: "Try another",
    back: "To the workshop",
    fullscreen: "Full screen",
    exitFullscreen: "Leave full screen",
    audioError: "Tap Leo to try again.",
    helloVoice:
      "Hello! I am Leo. I love dreaming up new things. Pick a machine and come and play!",
    completeVoice:
      "Well done! You have discovered what makes this machine move. Which invention shall we explore next?",
    machines: {
      screw: {
        name: "The flying screw",
        short: "Flying\nscrew",
        steps: [
          {
            title: "Give it a turn!",
            action: "Turn!",
            voice:
              "Take the handle and turn it. Look! The wooden pole turns with your hand.",
            result: "That is it! The handle makes the whole pole turn.",
          },
          {
            title: "Add a spiral",
            action: "Spin the spiral",
            voice:
              "This twisty shape is a spiral. I wrapped a sail around the pole. Give it a spin!",
            result:
              "The pole and the sail turn together. What a wonderful twist!",
          },
          {
            title: "Make some wind",
            action: "Faster!",
            voice:
              "We cannot see air, but we can make it move. Spin the spiral. Faster turns make a stronger wind in our model!",
            result: "Whoosh! The little trails help us imagine the air moving.",
          },
          {
            title: "Will it fly?",
            action: "Test it!",
            voice:
              "Here is my whole flying machine. I hoped it would carry me into the sky. Spin it. Will it fly?",
            result:
              "It spins, but stays on the ground! It is too heavy for people to power. Even a bold idea can teach us something.",
          },
        ],
      },
      cart: {
        name: "The wind-up car",
        short: "Wind-up\ncar",
        steps: [
          {
            title: "Roll the wheel",
            action: "Turn the wheel",
            voice:
              "This wheel turns around a wooden rod. The rod is called an axle. Take the wheel and give it a turn!",
            result: "The wheel turns, and the axle holds it in place.",
          },
          {
            title: "Teeth work together",
            action: "Turn a gear",
            voice:
              "These wheels have little teeth that fit together. Turn the small gear. Which way does the big one go?",
            result:
              "The big gear turns the other way, and more slowly! One gear moves the other.",
          },
          {
            title: "Wind the spring",
            action: "Wind it up!",
            voice:
              "Turn the crank. The spring winds tighter and stores the energy from your hand. We are getting our car ready to go!",
            result:
              "The spring is wound! Now it has energy to turn the wheels.",
          },
          {
            title: "Off we go!",
            action: "Let it go!",
            voice:
              "Our car is ready. Let it go! The spring unwinds, turns the gears, and makes the car move.",
            result:
              "It works! The spring turns the gears, and the gears turn the wheels. A car with no horse!",
          },
        ],
      },
      knight: {
        name: "The mechanical knight",
        short: "Mechanical\nknight",
        steps: [
          {
            title: "Bend an elbow",
            action: "Bend the arm",
            voice:
              "Try bending your own elbow. This wooden arm has a joint too. Tap it and see how it bends.",
            result: "A joint joins two parts of the arm and lets them bend.",
          },
          {
            title: "Pull the cord",
            action: "Pull!",
            voice:
              "Let us tie a cord to the arm. Pull the cord. What happens to the arm?",
            result:
              "The arm lifts! The cord carries your pull all the way to the arm.",
          },
          {
            title: "Down makes up",
            action: "Pull down",
            voice:
              "Run the cord over this little wheel. It is called a pulley. Pull down and watch the arm!",
            result:
              "You pull down, but the arm goes up! The pulley changes the direction of your pull.",
          },
          {
            title: "Hello, knight!",
            action: "Make a wave!",
            voice:
              "Here is the whole knight! This model is inspired by my drawings. Turn the crank. The knight will wave hello.",
            result:
              "Hello there! The crank pulls cords, the joints bend, and the knight waves. Like a very old robot!",
          },
        ],
      },
    },
  },
};

for (const lang of LANGUAGES) Object.assign(CONTENT[lang].machines, EXTRA_CONTENT[lang]);

export function narrationManifest() {
  return LANGUAGES.flatMap((lang) => {
    const c = CONTENT[lang],
      clips = [
        { lang, id: "hello", text: c.helloVoice },
        { lang, id: "complete", text: c.completeVoice },
      ];
    for (const [machine, data] of Object.entries(c.machines))
      data.steps.forEach((step, i) => {
        clips.push(
          { lang, id: `${machine}-${i + 1}`, text: step.voice },
          { lang, id: `${machine}-${i + 1}-result`, text: step.result },
        );
      });
    return clips;
  });
}
