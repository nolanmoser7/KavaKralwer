import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertBarSchema } from "@shared/schema";
import { X, Camera } from "lucide-react";
import { useLocation } from "wouter";
import { z } from "zod";

const submitBarSchema = insertBarSchema.extend({
  state: z.string().min(1, "State is required"),
});

type SubmitBarData = z.infer<typeof submitBarSchema>;

export default function SubmitBar() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const form = useForm<SubmitBarData>({
    resolver: zodResolver(submitBarSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      website: "",
      description: "",
      offersKava: false,
      offersKratom: false,
      amenities: [],
      vibe: "",
      latitude: "0",
      longitude: "0",
    },
  });

  const submitBarMutation = useMutation({
    mutationFn: async (data: SubmitBarData) => {
      // For now, we'll use a geocoding service or set default coordinates
      // In a real app, you'd integrate with Google Maps Geocoding API
      const geocodedData = {
        ...data,
        latitude: "32.7157", // Default San Diego coordinates
        longitude: "-117.1611",
      };
      
      return await apiRequest("POST", "/api/bars", geocodedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bars"] });
      toast({
        title: "Bar submitted successfully!",
        description: "Thank you for contributing to the Kava Krawler community.",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Error submitting bar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SubmitBarData) => {
    submitBarMutation.mutate(data);
  };

  const handleGoBack = () => {
    setLocation("/");
  };

  const amenityOptions = [
    "Outdoor Seating",
    "Live Music",
    "Food Menu",
    "Late Night",
    "Parking",
    "WiFi",
    "Pet Friendly",
    "Wheelchair Accessible"
  ];

  const vibeOptions = [
    "Chill & Relaxed",
    "Social & Lively",
    "Traditional",
    "Modern",
    "Beach Vibe",
    "Urban",
    "Wellness Focused"
  ];

  const stateOptions = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", 
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", 
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", 
    "Wisconsin", "Wyoming"
  ];

  return (
    <div className="pb-20 screen">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleGoBack}
            className="text-gray-600"
            data-testid="button-close"
          >
            <X className="h-6 w-6" />
          </Button>
          <h1 className="font-display text-xl font-semibold" data-testid="heading-submit-new-bar">
            Submit New Bar
          </h1>
          <div className="w-8"></div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-gray-700">Bar Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter bar name" 
                      className="p-4 rounded-xl focus:ring-coral focus:border-transparent"
                      {...field}
                      data-testid="input-bar-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-gray-700">Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Street address" 
                      className="p-4 rounded-xl focus:ring-coral focus:border-transparent"
                      {...field}
                      data-testid="input-address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-gray-700">City</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="City" 
                        className="p-4 rounded-xl focus:ring-coral focus:border-transparent"
                        {...field}
                        data-testid="input-city"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-gray-700">State</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="p-4 rounded-xl focus:ring-coral focus:border-transparent" data-testid="select-state">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {stateOptions.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-gray-700">Zip Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="12345" 
                        className="p-4 rounded-xl focus:ring-coral focus:border-transparent"
                        {...field}
                        data-testid="input-zip-code"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-gray-700">Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(555) 123-4567" 
                        className="p-4 rounded-xl focus:ring-coral focus:border-transparent"
                        {...field}
                        data-testid="input-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-gray-700">Website (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com" 
                      className="p-4 rounded-xl focus:ring-coral focus:border-transparent"
                      {...field}
                      data-testid="input-website"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="block font-medium text-gray-700 mb-2">What do they offer?</FormLabel>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="offersKava"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-offers-kava"
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Kava</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="offersKratom"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-offers-kratom"
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Kratom</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="vibe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-gray-700">Vibe (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="p-4 rounded-xl focus:ring-coral focus:border-transparent" data-testid="select-vibe">
                        <SelectValue placeholder="Select vibe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vibeOptions.map((vibe) => (
                        <SelectItem key={vibe} value={vibe}>
                          {vibe}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="block font-medium text-gray-700 mb-2">Photos (Coming Soon)</FormLabel>
              <Card className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400">
                <Camera className="w-8 h-8 mx-auto mb-2" />
                <p>Photo upload will be available soon</p>
              </Card>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-gray-700">Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional details about this bar..." 
                      rows={3} 
                      className="p-4 rounded-xl focus:ring-coral focus:border-transparent resize-none"
                      {...field}
                      data-testid="textarea-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-coral hover:bg-coral/90 text-white font-semibold py-4 rounded-xl shadow-lg"
              disabled={submitBarMutation.isPending}
              data-testid="button-submit-bar"
            >
              {submitBarMutation.isPending ? "Submitting..." : "Submit Bar"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
