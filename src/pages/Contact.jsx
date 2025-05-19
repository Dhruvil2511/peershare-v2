import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Coffee, Github, Linkedin } from "lucide-react";
import dp from "../assets/dp.webp";
import pg from "../assets/pg.webp";
const creators = [
    {
        name: "Dhruvil Prajapati",
        image: dp,
        role: "Developer",
        email: "mailto:peershare.contact@gmail.com",
        github: "https://github.com/dhruvil2511",
        linkedin: "https://linkedin.com/in/dhruvil2511",
    },
    {
        name: "Priyanshu Gupta",
        image: pg,
        role: "Developer",
        email: "mailto:peershare.contact@gmail.com",
        github: "https://github.com/priyanshugupta24",
        linkedin: "https://www.linkedin.com/in/priyanshu-gupta-45b285224/",
    },
];

export default function Contact() {
    return (
        <div className="pt-[80px] pb-20 px-4 min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-8 text-center">Get in Touch ☕</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 place-items-center">
                {creators.map((creator, index) => (
                    <Card
                        key={index}
                        className="w-[320px] md:w-[380px] p-6 text-center shadow-lg rounded-2xl"
                    >
                        <img
                            src={creator.image}
                            alt={creator.name}
                            className="w-32 h-32 mx-auto rounded-full object-cover mb-4 shadow-md border-4 border-white"
                        />
                        <h2 className="text-2xl font-bold">{creator.name}</h2>
                        <p className="text-sm text-muted-foreground mb-4">{creator.role}</p>
                        <div className="flex justify-center gap-4">
                            <a href={creator.github} target="_blank" rel="noopener noreferrer">
                                <Github className="hover:text-black transition" />
                            </a>
                            <a href={creator.linkedin} target="_blank" rel="noopener noreferrer">
                                <Linkedin className="hover:text-blue-600 transition" />
                            </a>
                            <a href={creator.email}>
                                <Mail className="hover:text-red-500 transition" />
                            </a>
                        </div>
                    </Card>
                ))}
            </div>


            <div className="text-center mt-12">
                <h3 className="text-2xl font-bold mb-3 animate-pulse">Enjoying Peer Share?</h3>
                <p className="text-base text-muted-foreground mb-4 max-w-md mx-auto">
                    If Peer Share saved you time, helped you connect, or made you smile — consider fueling our coding sessions with a coffee ☕💻❤️
                </p>
                <a
                    href="https://ko-fi.com/dhruvil2511"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                >
                    <Button
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
                    >
                        <Coffee size={20} /> Buy us a coffee
                    </Button>
                </a>
                <p className="mt-2 text-xs text-muted-foreground italic">We’ll sip it while fixing bugs and building cool stuff 🚀</p>
            </div>

        </div>
    );
}
