"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DialogFooter } from "@/components/ui/dialog";
import { notificationSchema } from "@/lib/validations/admin/notification.validation";

type NotificationFormValues = z.infer<typeof notificationSchema>;

const notifications = [
  { label: "Pop-up notification on desktop", state: "desktopNotification" },
  { label: "Email notification", state: "emailNotification" },
  { label: "WhatsApp notification", state: "whatsappNotification" },
  { label: "Mobile Message Notification", state: "smsNotification" },
] as const;

const NotificationForm = () => {
  const form = useForm<NotificationFormValues>({
    defaultValues: {
      desktopNotification: false,
      emailNotification: false,
      whatsappNotification: false,
      smsNotification: false,
    },
    resolver: zodResolver(notificationSchema),
  });

  const onSubmit = (data: NotificationFormValues) => {
    console.log("Saved settings:", data);
    // Implement save logic (e.g., API call)
  };

  const handleCancel = () => {
    form.reset(); // Reset form to default values
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="max-w-lg mx-auto p-6">
        <div className="rounded-lg p-6 border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {notifications.map(({ label, state }) => (
                <FormField
                  key={state}
                  control={form.control}
                  name={state}
                  render={({ field }) => (
                    <FormItem className="flex justify-between gap-6 items-center py-4 border-b last:border-b-0">
                      <FormLabel className="text-base font-normal tracking-wider">
                        {label}
                      </FormLabel>
                      <FormControl>
                        <Switch
                          size="md"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-blue-500"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}

              {/* Dialog Footer with Cancel & Save buttons */}
              <DialogFooter className="flex justify-end gap-2 space-x-4 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default NotificationForm;

// "use client";
// import { Toggle } from "@/components/ui/toggle";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { useState } from "react";

// const notifications = [
//   { label: "Pop-up notification on desktop", state: "desktopNotification" },
//   { label: "Email notification", state: "emailNotification" },
//   { label: "WhatsApp notification", state: "whatsappNotification" },
//   { label: "Mobile Message Notification", state: "smsNotification" },
// ];

// type NotificationKeys =
//   | "desktopNotification"
//   | "emailNotification"
//   | "whatsappNotification"
//   | "smsNotification";

// const NotificationSettings = () => {
//   const [settings, setSettings] = useState<Record<NotificationKeys, boolean>>({
//     desktopNotification: false,
//     emailNotification: false,
//     whatsappNotification: false,
//     smsNotification: false,
//   });

//   const handleToggle = (key: NotificationKeys) => {
//     setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
//   };

//   const handleSave = () => {
//     console.log("Saved settings:", settings);
//     // Implement save logic here (e.g., API call)
//   };

//   return (
//     <div className="max-w-lg mx-auto p-6">
//       <h2 className="text-3xl font-bold text-center mb-6">
//         Notification Settings
//       </h2>
//       <Card className="shadow-lg rounded-lg p-6">
//         <CardContent className="space-y-6">
//           {notifications.map(({ label, state }, index) => (
//             <div
//               key={state}
//               className={`flex justify-between items-center py-4 gap-4 ${index !== notifications.length - 1 ? "border-b" : ""}`}
//             >
//               <span className="text-lg font-medium">{label}</span>
//               <Toggle
//                 className="h-10 w-20 text-sm"
//                 pressed={settings[state as NotificationKeys]}
//                 onPressedChange={() => handleToggle(state as NotificationKeys)}
//               >
//                 {settings[state as NotificationKeys] ? "On" : "Off"}
//               </Toggle>
//             </div>
//           ))}
//           <div className="flex justify-center mt-6">
//             <Button className="px-6 py-2 text-lg" onClick={handleSave}>
//               Save
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default NotificationSettings;
