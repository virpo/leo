export const EXTRA_CONTENT = {
  sk: {
    parachute: {
      name: "Leov padák", short: "Leov\npadák",
      smaller: "Zmenši padák", larger: "Zväčši padák",
      steps: [
        { title: "Prečo to padá?", action: "Pusti košík", voice: "Pusti malý košík. Zem ho priťahuje nadol. Táto sila sa volá gravitácia.", result: "Košík spadol rýchlo. Zem ho ťahá stále nadol." },
        { title: "Vzduch pomáha", action: "Vyskúšaj padák", voice: "Pridáme plachtu. Vzduch jej kladie odpor a spomalí pád. Pusti ten istý košík.", result: "S plachtou padá košík pomalšie. Vzduch ho brzdí!" },
        { title: "Ktorý bude pomalší?", action: "Pusti oba", voice: "Dva rovnaké košíky, dva rôzne veľké padáky. Pusti ich naraz. Ktorý pristane neskôr?", result: "Väčší padák padá pomalšie. Väčšia plachta kladie vzduchu väčší odpor." },
        { title: "Navrhni si padák", action: "Pusti oba", voice: "Ľavý padák zostane rovnaký. Pravý zmenši mínusom alebo zväčši plusom. Potom pusť oba a porovnaj ich.", result: "Pristáli sme! Skús inú veľkosť plachty a porovnaj pád." },
      ],
    },
    boat: {
      name: "Loď s lopatkami", short: "Loď s\nlopatkami",
      backward: "Späť",
      steps: [
        { title: "Zatlač na vodu", action: "Potiahni lopatku", voice: "Potiahni lopatku cez vodu. Pozri, ktorým smerom sa voda pohne.", result: "Lopatka tlačí vodu dozadu. Takto môžeme poháňať loď." },
        { title: "Lopatky na kolese", action: "Roztoč koleso", voice: "Na koleso pripevníme viac lopatiek. Roztoč ho. Jedna lopatka vychádza a ďalšia už tlačí na vodu.", result: "Koleso opakuje záber stále dookola. Vodu tlačí dozadu." },
        { title: "Voda späť, loď vpred", action: "Pohni loďou", voice: "Dve kolesá spojíme jednou osou. Otáčaj kľukou. Voda ide dozadu a loď dopredu.", result: "Ide to! Lopatky tlačia na vodu a voda tlačí na loď opačným smerom." },
        { title: "A teraz opačne!", action: "Vpred", voice: "Čo sa stane, keď otočíme kolesá naopak? Skús to. Alebo ich otáčaj prstom na modeli.", result: "Aj loď zmení smer! Kolesá tlačia vodu opačne, a tak sa obráti aj pohyb lode." },
      ],
    },
    lock: {
      name: "Výťah pre lode", short: "Výťah\npre lode",
      phases: ["Zatvor bránu", "Napusti vodu", "Otvor bránu", "Pusti loď", "Ešte raz"],
      busy: ["Brána sa zatvára", "Voda stúpa", "Brána sa otvára", "Loď prechádza"],
      steps: [
        { title: "Voda hľadá rovnováhu", action: "Otvor prietok", voice: "Na jednej strane je viac vody. Otvor malý prietok. Sleduj obe hladiny.", result: "Voda tečie z vyššej hladiny k nižšej. Napokon sú obe rovnako vysoko." },
        { title: "Voda zdvihne loď", action: "Napusti vodu", voice: "Loď pláva v komore. Pusť dnu vodu a sleduj, čo sa stane s loďou.", result: "Stúpa voda aj loď! Loď nepotrebuje výťahové lano. Drží ju voda." },
        { title: "Teraz otvor bránu", action: "Otvor bránu", voice: "Hladiny sú teraz rovnako vysoko. Otvor veľkú bránu. Voda sa nevyvalí z vyššej strany.", result: "Brána sa otvorila. Keď sa hladiny vyrovnajú, loď môže bezpečne prejsť." },
        { title: "Prevez loď cez komoru", action: "Zatvor bránu", voice: "Dostaň loď do vyššieho kanála. Zatvor dolnú bránu, napusti vodu, otvor hornú bránu a pusť loď ďalej.", result: "Dokázal si to! Komora zdvihla loď na vyššiu hladinu. Je to vodný výťah." },
      ],
    },
  },
  en: {
    parachute: {
      name: "Leo’s parachute", short: "Leo’s\nparachute",
      smaller: "Smaller canopy", larger: "Bigger canopy",
      steps: [
        { title: "Why does it fall?", action: "Drop the basket", voice: "Let the little basket go. Earth pulls it down. That pull is called gravity.", result: "The basket fell quickly. Gravity keeps pulling it down." },
        { title: "Air lends a hand", action: "Try the parachute", voice: "Add a canopy. Air pushes against it and slows the fall. Drop the same basket again.", result: "With a canopy, the basket falls more slowly. Air is a brake!" },
        { title: "Which falls more slowly?", action: "Drop them both", voice: "Two matching baskets, two different canopy sizes. Drop them together. Which one lands last?", result: "The bigger canopy falls more slowly. More area makes more air resistance." },
        { title: "Design your parachute", action: "Drop them both", voice: "The left parachute stays the same. Make the right one smaller with minus or bigger with plus. Then drop them together and compare.", result: "We landed! Try a different canopy size and compare the fall." },
      ],
    },
    boat: {
      name: "The paddle boat", short: "Paddle\nboat",
      backward: "Back",
      steps: [
        { title: "Push the water", action: "Pull the paddle", voice: "Pull this paddle through the water. Watch which way the water moves.", result: "The paddle pushes water backward. That can help us move a boat." },
        { title: "Paddles on a wheel", action: "Turn the wheel", voice: "Put more paddles on a wheel. Turn it. As one paddle comes out, another pushes against the water.", result: "The wheel repeats the stroke, pushing water backward." },
        { title: "Water back, boat forward", action: "Move the boat", voice: "Join two wheels with one axle. Turn the crank. Water goes backward and the boat goes forward.", result: "It works! The paddles push water, and water pushes the boat the other way." },
        { title: "Now go the other way!", action: "Forward", voice: "What happens if we turn the wheels the other way? Try it. You can also turn them with your finger on the model.", result: "The boat changes direction too! Reverse the push on the water and you reverse the boat." },
      ],
    },
    lock: {
      name: "A lift for boats", short: "A lift\nfor boats",
      phases: ["Close the gate", "Fill with water", "Open the gate", "Let the boat go", "Again"],
      busy: ["Gate closing", "Water rising", "Gate opening", "Boat passing"],
      steps: [
        { title: "Water finds its level", action: "Open the sluice", voice: "One side has a higher water level. Open the little sluice. Watch both water levels.", result: "Water flows from the higher side to the lower side. The levels meet." },
        { title: "Water lifts the boat", action: "Let water in", voice: "The boat is floating in a chamber. Let water in and watch what happens to the boat.", result: "The water rises, and so does the boat! Water holds it up, not a lifting rope." },
        { title: "Now open the gate", action: "Open the gate", voice: "The water is equally high on both sides. Open the big gate. Water will not rush in from a higher side.", result: "The gate opens. When the levels match, the boat can pass through." },
        { title: "Take the boat upstairs", action: "Close the gate", voice: "Get the boat to the higher canal. Close the lower gate, let water in, open the upper gate, then let the boat through.", result: "You did it! The chamber raised the boat to the higher water. A water-powered lift!" },
      ],
    },
  },
};
