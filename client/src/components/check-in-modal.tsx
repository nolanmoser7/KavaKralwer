import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCheckInSchema } from "@shared/schema";
import ShellRating from "./shell-rating";
import { Camera, X } from "lucide-react";
import { z } from "zod";

const checkInFormSchema = insertCheckInSchema.extend({
  rating: z.number().min(1).max(5),
});

type CheckInFormData = z.infer<typeof checkInFormSchema>;

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  barId: string;
  barName: string;
}

export default function CheckInModal({ isOpen, onClose, barId, barName }: CheckInModalProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CheckInFormData>({
    resolver: zodResolver(checkInFormSchema),
    defaultValues: {
      barId,
      note: "",
      photoUrl: "",
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async (data: CheckInFormData) => {
      // Create check-in
      const checkInResponse = await apiRequest("POST", `/api/bars/${barId}/checkin`, {
        note: data.note,
        photoUrl: data.photoUrl,
      });

      // If rating is provided, also create a review
      if (selectedRating > 0) {
        await apiRequest("POST", `/api/bars/${barId}/reviews`, {
          rating: selectedRating,
          comment: data.note,
          photoUrl: data.photoUrl,
        });
      }

      return checkInResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/checkins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bars", barId, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bars", barId] });
      
      toast({
        title: "Check-in successful! 🏝️",
        description: `You earned 10 points for visiting ${barName}`,
      });
      
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Check-in failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    form.reset();
    setSelectedRating(0);
    onClose();
  };

  const onSubmit = (data: CheckInFormData) => {
    checkInMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 transform transition-transform duration-300 max-w-none h-auto border-0">
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="text-center flex-1">
            <h2 className="font-display text-2xl font-bold mb-2" data-testid="text-checkin-title">
              Check in at {barName}
            </h2>
            <p className="text-gray-600">Share your experience with the community</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleClose}
            className="absolute top-4 right-4"
            data-testid="button-close-checkin"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Rating Section */}
            <div className="text-center">
              <FormLabel className="block font-medium text-gray-700 mb-4">How was it?</FormLabel>
              <div className="flex justify-center mb-4">
                <ShellRating
                  rating={selectedRating}
                  interactive={true}
                  onRatingChange={setSelectedRating}
                  size="lg"
                  data-testid="rating-shells"
                />
              </div>
              {selectedRating > 0 && (
                <p className="text-sm text-gray-600">
                  {selectedRating === 1 && "Not great"}
                  {selectedRating === 2 && "Could be better"}
                  {selectedRating === 3 && "Pretty good"}
                  {selectedRating === 4 && "Really good!"}
                  {selectedRating === 5 && "Amazing! 🏝️"}
                </p>
              )}
            </div>

            {/* Note Section */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Share your thoughts (optional)..."
                      rows={3}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-coral focus:border-transparent resize-none"
                      {...field}
                      data-testid="textarea-checkin-note"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Photo Section */}
            <div>
              <FormLabel className="block font-medium text-gray-700 mb-2">Add a photo</FormLabel>
              <div 
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-coral transition-colors"
                data-testid="photo-upload-area"
              >
                <Camera className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600 text-sm">Tap to add photo (Coming soon)</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={handleClose}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700"
                data-testid="button-cancel-checkin"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={checkInMutation.isPending}
                className="flex-1 py-3 bg-coral hover:bg-coral/90 text-white font-semibold rounded-xl"
                data-testid="button-submit-checkin"
              >
                {checkInMutation.isPending ? "Checking In..." : "Check In"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
