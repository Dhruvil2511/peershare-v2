import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const adjectives = [
  "Brave", "Calm", "Charming", "Cheerful", "Clever", "Cool", "Cozy", "Creative", "Curious", "Daring",
  "Delightful", "Dreamy", "Eager", "Elegant", "Epic", "Fancy", "Fearless", "Feisty", "Fierce", "Friendly",
  "Funny", "Gentle", "Giddy", "Gleeful", "Glorious", "Golden", "Graceful", "Gracious", "Happy", "Helpful",
  "Humble", "Hushed", "Inquisitive", "Jolly", "Joyful", "Kind", "Lively", "Lucky", "Luminous", "Majestic",
  "Mellow", "Mighty", "Mischievous", "Modest", "Mysterious", "Nimble", "Peaceful", "Perky", "Playful",
  "Polite", "Powerful", "Proud", "Quiet", "Quick", "Radiant", "Rapid", "Rare", "Rebellious", "Serene",
  "Sharp", "Shiny", "Shy", "Silly", "Sincere", "Sleepy", "Smart", "Sneaky", "Snug", "Soft", "Speedy",
  "Spirited", "Spunky", "Steady", "Stormy", "Strong", "Stunning", "Sunny", "Sweet", "Swift", "Tender",
  "Thankful", "Thoughtful", "Tricky", "Tranquil", "Unique", "Vibrant", "Vivid", "Warm", "Wavy", "Wild",
  "Wise", "Witty", "Wonderful", "Zany", "Zealous"
];


const animalNames = [
  "Alligator", "Chipmunk", "Gopher", "Liger", "Quagga", "Anteater", "Chupacabra", "Grizzly",
  "Llama", "Rabbit", "Armadillo", "Cormorant", "Hedgehog", "Manatee", "Raccoon", "Auroch",
  "Coyote", "Hippo", "Mink", "Rhino", "Axolotl", "Crow", "Hyena", "Monkey", "Sheep", "Badger",
  "Dingo", "Ibex", "Moose", "Shrew", "Bat", "Dinosaur", "Ifrit", "Narwhal", "Skunk", "Beaver",
  "Dolphin", "Iguana", "Orangutan", "Squirrel", "Buffalo", "Duck", "Jackal", "Otter", "Tiger",
  "Camel", "Elephant", "Kangaroo", "Panda", "Turtle", "Capybara", "Ferret", "Koala", "Penguin",
  "Walrus", "Chameleon", "Fox", "Kraken", "Platypus", "Wolf", "Cheetah", "Frog", "Lemur",
  "Pumpkin", "Wolverine", "Chinchilla", "Giraffe", "Leopard", "Python", "Wombat"
];

const bgColors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500",
  "bg-neutral-500",
  "bg-zinc-500",
  "bg-stone-500",
  "bg-gray-500",
  "bg-slate-500"
];


var verb = adjectives[Math.floor(Math.random() * adjectives.length)]
var animal = animalNames[Math.floor(Math.random() * animalNames.length)]
const randomColor = bgColors[Math.floor(Math.random() * bgColors.length)];
var name = verb + ' ' + animal;

export { name, randomColor };


