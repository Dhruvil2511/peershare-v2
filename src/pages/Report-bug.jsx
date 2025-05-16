import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const ReportBug = () => {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch("https://formspree.io/f/meogrqja", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                },
                body: formData,
            });

            const result = await response.json();

            if (result.ok || response.status === 200) {
                toast.success("Bug report submitted successfully!");
                e.target.reset(); // reset the form
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        } catch (err) {
            toast.error("Network error. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-[80px] pb-20 px-4 sm:py-10 min-h-screen flex items-center justify-center bg-background">
            <Card className="w-full max-w-2xl shadow-2xl border border-muted rounded-2xl">
                <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">
                        🐞 Report a Bug
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Your Name</label>
                            <Input name="name" placeholder="John Doe" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email Address</label>
                            <Input type="email" name="email" placeholder="john@example.com" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Issue Type</label>
                            <select
                                name="issueType"
                                required
                                className="w-full rounded-md border text-foreground p-2 bg-white dark:bg-[#212121]"
                            >
                                <option value="">Select an issue</option>
                                <option value="bug">Bug</option>
                                <option value="crash">App Crash</option>
                                <option value="ui">UI/UX Problem</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <Textarea
                                name="description"
                                placeholder="Describe the issue in detail and also tell us the flow"
                                className="h-32 overflow-auto resize-none"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Submitting..." : "Submit Bug Report"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ReportBug;
