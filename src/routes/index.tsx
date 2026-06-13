import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, ChevronDown, Phone, Mail, MapPin, Clock, Truck, Banknote, Recycle, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sage Hill Bottle Depot — Valet Drop-Off Service" },
      { name: "description", content: "Calgary's easiest bottle depot experience. Book a valet drop-off time and get paid via Interac e-Transfer." },
      { property: "og:title", content: "Sage Hill Bottle Depot — Valet Drop-Off Service" },
      { property: "og:description", content: "Calgary's easiest bottle depot experience. Book a valet drop-off time and get paid via Interac e-Transfer." },
    ],
  }),
  component: Index,
});

const bookingSchema = z.object({
  customer_name: z.string().min(1, "Full name is required"),
  customer_email: z.string().min(1, "Email is required").email("Invalid email address"),
  customer_phone: z.string().min(1, "Phone number is required"),
  dropoff_date: z.date({ required_error: "Drop-off date is required" }),
  dropoff_time: z.string().min(1, "Drop-off time is required"),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

function Index() {
  const formRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      dropoff_time: "",
      notes: "",
    },
  });

  const selectedDate = watch("dropoff_date");

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        dropoff_date: format(data.dropoff_date, "yyyy-MM-dd"),
        dropoff_time: data.dropoff_time,
        notes: data.notes || "",
        cal_event_id: "",
        source: "Landing Page",
      };

      const response = await fetch("https://n8n.thebfsai.com/webhook/manny-valet-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Webhook returned non-OK status");
      }

      const result = await response.json();

      if (result && result.success === true) {
        const bookingId = result.booking_id || "";
        toast.success(
          `Booking confirmed! Check your email for details.${bookingId ? ` Your booking ID is ${bookingId}.` : ""}`
        );
        reset();
      } else {
        toast.error("Something went wrong. Please try again or call us directly.");
      }
    } catch {
      toast.error("Something went wrong. Please try again or call us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = [
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Recycle className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">Sage Hill Bottle Depot</span>
          </div>
          <Button onClick={scrollToForm} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Book Now
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background px-4 pb-20 pt-16 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <MapPin className="h-4 w-4" />
            Calgary, AB
          </div>
          <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Drop Off Your Bottles — We'll Handle The Rest
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Calgary's easiest bottle depot experience. Book a valet drop-off time and get paid via Interac e-Transfer.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              onClick={scrollToForm}
              size="lg"
              className="bg-primary px-8 text-lg font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Book Your Drop-Off
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">How It Works</h2>
            <p className="mt-3 text-lg text-muted-foreground">Three simple steps to cash in your bottles</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            <StepCard
              number="1"
              icon={<Clock className="h-7 w-7 text-primary" />}
              title="Choose a Time Slot"
              description="Pick a convenient drop-off date and time using the booking form below."
            />
            <StepCard
              number="2"
              icon={<Truck className="h-7 w-7 text-primary" />}
              title="Drive Up — We Unload"
              description="Pull up to our depot and our team will unload your bottles for you. No heavy lifting."
            />
            <StepCard
              number="3"
              icon={<Banknote className="h-7 w-7 text-primary" />}
              title="Get Paid Fast"
              description="Receive your Interac e-Transfer within 2 business days. Simple as that."
            />
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section ref={formRef} id="booking" className="px-4 py-20">
        <div className="mx-auto max-w-xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Book Your Drop-Off</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Fill in your details and we'll confirm your appointment
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
          >
            <div>
              <Label htmlFor="customer_name">Full Name</Label>
              <Input
                id="customer_name"
                placeholder="John Doe"
                {...register("customer_name")}
                className={cn("mt-1.5", errors.customer_name && "border-destructive")}
              />
              {errors.customer_name && (
                <p className="mt-1 text-sm text-destructive">{errors.customer_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="customer_email">Email</Label>
              <Input
                id="customer_email"
                type="email"
                placeholder="john@example.com"
                {...register("customer_email")}
                className={cn("mt-1.5", errors.customer_email && "border-destructive")}
              />
              {errors.customer_email && (
                <p className="mt-1 text-sm text-destructive">{errors.customer_email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="customer_phone">Phone Number</Label>
              <Input
                id="customer_phone"
                type="tel"
                placeholder="(403) 555-0123"
                {...register("customer_phone")}
                className={cn("mt-1.5", errors.customer_phone && "border-destructive")}
              />
              {errors.customer_phone && (
                <p className="mt-1 text-sm text-destructive">{errors.customer_phone.message}</p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label>Drop-off Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "mt-1.5 w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground",
                        errors.dropoff_date && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => setValue("dropoff_date", date as Date, { shouldValidate: true })}
                      initialFocus
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      className="pointer-events-auto p-3"
                    />
                  </PopoverContent>
                </Popover>
                {errors.dropoff_date && (
                  <p className="mt-1 text-sm text-destructive">{errors.dropoff_date.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="dropoff_time">Drop-off Time</Label>
                <div className="relative mt-1.5">
                  <select
                    id="dropoff_time"
                    {...register("dropoff_time")}
                    className={cn(
                      "flex h-9 w-full appearance-none items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                      errors.dropoff_time && "border-destructive"
                    )}
                  >
                    <option value="">Select a time</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
                {errors.dropoff_time && (
                  <p className="mt-1 text-sm text-destructive">{errors.dropoff_time.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Anything we should know? Rough bag count, special items, etc."
                rows={3}
                {...register("notes")}
                className="mt-1.5 resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary py-6 text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? "Submitting..." : "Confirm My Booking"}
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/50 px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <Recycle className="h-5 w-5 text-primary" />
                <span className="text-lg font-bold text-foreground">Sage Hill Bottle Depot</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Calgary, AB</p>
            </div>
            <div className="flex flex-col items-center gap-3 sm:items-end">
              <a
                href="mailto:info@sagehillbottledepot.ca"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Mail className="h-4 w-4" />
                info@sagehillbottledepot.ca
              </a>
              <a
                href="https://sagehillbottledepot.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <MapPin className="h-4 w-4" />
                sagehillbottledepot.ca
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Sage Hill Bottle Depot. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepCard({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        {icon}
      </div>
      <div className="absolute -top-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {number}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
