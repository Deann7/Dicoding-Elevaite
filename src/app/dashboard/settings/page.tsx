import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Building, AlertOctagon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">System Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Konfigurasi profil perusahaan dan keamanan data.
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="flex w-full justify-start rounded-none p-0 h-10 border-b border-black bg-transparent">
          <TabsTrigger value="general" className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white text-xs font-bold uppercase tracking-wide h-full px-6">General</TabsTrigger>
          <TabsTrigger value="danger" className="rounded-none data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs font-bold uppercase tracking-wide h-full px-6 text-red-600">Danger Zone</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* GENERAL TAB */}
          <TabsContent value="general" className="space-y-6">
            <Card className="rounded-none border-black/20 shadow-none">
              <CardHeader className="border-b border-black/10">
                <CardTitle className="text-sm uppercase tracking-widest font-bold flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Business Profile
                </CardTitle>
                <CardDescription className="text-xs font-mono uppercase">Manage your organizational identity</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest">Business Name</Label>
                    <Input defaultValue="PT Sinergi Manufaktur" className="rounded-none border-black focus-visible:ring-black font-medium" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest">Industry Segment</Label>
                    <Input defaultValue="EV Battery Manufacturing" className="rounded-none border-black focus-visible:ring-black font-medium" />
                  </div>
                </div>
                <div className="pt-4">
                  <Button className="rounded-none font-bold uppercase tracking-widest text-xs bg-black text-white px-8">
                    <Save className="h-4 w-4 mr-2" /> Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DANGER ZONE TAB */}
          <TabsContent value="danger" className="space-y-6">
            <Card className="rounded-none border-red-600 shadow-none bg-red-50/50">
              <CardHeader className="border-b border-red-200">
                <CardTitle className="text-sm uppercase tracking-widest font-bold flex items-center gap-2 text-red-600">
                  <AlertOctagon className="h-4 w-4" />
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-xs font-mono uppercase text-red-600/70">Irreversible administrative actions</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-red-200 p-4 bg-white">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-black">Purge QA Scans</h4>
                    <p className="text-[10px] text-black/60 font-mono mt-1">Menghapus semua histori dokumen inspeksi QA.</p>
                  </div>
                  <Button variant="outline" className="rounded-none font-bold uppercase tracking-widest text-xs border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors">
                    Purge Data
                  </Button>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-red-200 p-4 bg-white">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-black">Factory Reset</h4>
                    <p className="text-[10px] text-black/60 font-mono mt-1">Aksi ini akan menghapus permanen semua data palet baterai dan audit logs.</p>
                  </div>
                  <Button variant="destructive" className="rounded-none font-bold uppercase tracking-widest text-xs bg-red-600 hover:bg-red-700 text-white transition-colors">
                    Wipe All Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
}
