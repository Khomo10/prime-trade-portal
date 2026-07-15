import { useGetMe, useUpdateMe, getGetMeQueryKey } from "@/api/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Shield, CheckCircle2 } from "lucide-react";
import { useUser } from "@clerk/react";
import { format, parseISO } from "date-fns";

const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters." }).max(30),
  bio: z.string().max(160, { message: "Bio must not be longer than 160 characters." }).optional(),
  country: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Settings() {
  const { data: member, isLoading } = useGetMe();
  const updateMeMutation = useUpdateMe();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
      bio: "",
      country: "",
    },
  });

  useEffect(() => {
    if (member) {
      form.reset({
        displayName: member.displayName || "",
        bio: member.bio || "",
        country: member.country || "",
      });
    }
  }, [member, form]);

  function onSubmit(data: ProfileFormValues) {
    updateMeMutation.mutate({ data }, {
      onSuccess: () => {
        toast({
          title: "Profile updated",
          description: "Your profile information has been saved successfully.",
        });
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      }
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-32 mb-2"/><Skeleton className="h-4 w-64"/></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and profile preferences.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-border">
          <CardHeader className="bg-muted/20 border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Account Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center text-emerald-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Verified</span>
                  <span className="px-1.5 py-0.5 rounded bg-muted text-xs capitalize">{member?.memberType || 'Retail'} Account</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Member since {member?.joinedAt ? format(parseISO(member.joinedAt), 'MMMM yyyy') : '...'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Public Profile
            </CardTitle>
            <CardDescription>
              This is how others will see you on the leaderboard.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your display name" {...field} className="max-w-md" />
                      </FormControl>
                      <FormDescription>
                        This is your public trading moniker.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us a bit about your trading style..." 
                          className="resize-none max-w-lg" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Max 160 characters.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="max-w-[280px]">
                            <SelectValue placeholder="Select a country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ZAF">South Africa</SelectItem>
                          <SelectItem value="NAM">Namibia</SelectItem>
                          <SelectItem value="BWA">Botswana</SelectItem>
                          <SelectItem value="ZWE">Botswana</SelectItem>
                          <SelectItem value="GBR">United Kingdom</SelectItem>
                          <SelectItem value="USA">United States</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="border-t border-border bg-muted/10 pt-4">
                <Button type="submit" disabled={updateMeMutation.isPending || !form.formState.isDirty}>
                  {updateMeMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
