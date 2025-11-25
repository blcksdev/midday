"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@midday/ui/card";
import { Button } from "@midday/ui/button";
import { Icons } from "@midday/ui/icons";
import { Badge } from "@midday/ui/badge";
import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@midday/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@midday/ui/tabs";
import { cn } from "@midday/ui/cn";

interface ContractDetailsProps {
  contract: any;
}

export function ContractDetails({ contract }: ContractDetailsProps) {
  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false);
  const [signatureType, setSignatureType] = useState<"draw" | "upload">("draw");
  const [isSigned, setIsSigned] = useState(contract.status === "signed");
  
  // Signature Canvas Logic
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (isSignDialogOpen && signatureType === "draw") {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
            ctx.strokeStyle = "#000";
            
            // Handle resizing
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
          }
        }
      }, 100);
    }
  }, [isSignDialogOpen, signatureType]);

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSign = () => {
    // Here you would save the signature
    setIsSigned(true);
    setIsSignDialogOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
      {/* Document Viewer (Left Side) */}
      <Card className="flex-1 p-0 overflow-hidden bg-gray-100 dark:bg-gray-900 flex flex-col">
        <div className="p-4 border-b bg-background flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Icons.Description size={16} />
            <span className="font-medium">{contract.title}.pdf</span>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Icons.ProjectStatus size={14} />
            Download PDF
          </Button>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          {/* Placeholder for PDF Viewer */}
          <div className="bg-white text-black p-12 shadow-lg max-w-3xl w-full min-h-[800px] flex flex-col gap-8">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold uppercase">{contract.type}</h1>
              <div className="text-right text-sm">
                <p>Date: {new Date(contract.createdAt).toLocaleDateString()}</p>
                <p>Contract ID: {contract.id}</p>
              </div>
            </div>

            <div className="space-y-4 text-sm leading-relaxed">
              <p><strong>BETWEEN:</strong> Midday Inc ("Company")</p>
              <p><strong>AND:</strong> The Customer ("Client")</p>
              
              <p className="mt-8">
                <strong>1. SERVICES PROVIDED</strong><br/>
                The Company agrees to provide the services as described in the attached Statement of Work.
              </p>
              
              <p>
                <strong>2. TERM AND TERMINATION</strong><br/>
                This Agreement shall commence on the Effective Date and continue until terminated by either party.
              </p>

              <p>
                <strong>3. CONFIDENTIALITY</strong><br/>
                Both parties agree to maintain the confidentiality of all proprietary information exchanged during the term of this Agreement.
              </p>
              
              <div className="mt-12 pt-8 border-t flex justify-between">
                <div className="w-64">
                  <p className="font-bold mb-4">Signed by Company:</p>
                  <div className="h-16 border-b border-black mb-2 flex items-end pb-1">
                    <span className="font-script text-2xl">Midday Inc.</span>
                  </div>
                  <p className="text-xs">Authorized Signature</p>
                </div>

                <div className="w-64">
                  <p className="font-bold mb-4">Signed by Client:</p>
                  {isSigned ? (
                     <div className="h-16 border-b border-black mb-2 flex items-end pb-1">
                       <span className="font-script text-2xl text-blue-600">Digitally Signed</span>
                     </div>
                  ) : (
                    <div className="h-16 border-b border-black border-dashed mb-2 bg-yellow-50 flex items-center justify-center text-xs text-muted-foreground cursor-pointer hover:bg-yellow-100 transition-colors" onClick={() => setIsSignDialogOpen(true)}>
                      Click to Sign
                    </div>
                  )}
                  <p className="text-xs">Authorized Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Sidebar (Right Side) */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Status</h3>
          <div className="flex items-center gap-2 mb-4">
            <Badge className={cn("w-full justify-center py-1.5", isSigned ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800")}>
              {isSigned ? (
                <>
                  <Icons.Check size={14} className="mr-2" />
                  Signed
                </>
              ) : (
                <>
                  <Icons.History size={14} className="mr-2" />
                  Pending Signature
                </>
              )}
            </Badge>
          </div>
          
          {!isSigned && (
            <Button className="w-full gap-2" onClick={() => setIsSignDialogOpen(true)}>
              <Icons.Edit size={16} />
              Sign Document
            </Button>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Details</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Type</p>
              <p className="font-medium">{contract.type}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">{new Date(contract.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Parties</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {contract.parties.map((party: string) => (
                  <Badge key={party} variant="secondary" className="text-xs">
                    {party}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 flex-1">
          <h3 className="font-semibold mb-4">Audit Trail</h3>
          <div className="relative pl-4 border-l space-y-6">
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary" />
              <p className="text-sm font-medium">Document Created</p>
              <p className="text-xs text-muted-foreground">{new Date(contract.createdAt).toLocaleString()}</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary" />
              <p className="text-sm font-medium">Viewed by You</p>
              <p className="text-xs text-muted-foreground">{new Date().toLocaleString()}</p>
            </div>
            {isSigned && (
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-green-500" />
                <p className="text-sm font-medium">Signed by You</p>
                <p className="text-xs text-muted-foreground">{new Date().toLocaleString()}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Signature Dialog */}
      <Dialog open={isSignDialogOpen} onOpenChange={setIsSignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign Document</DialogTitle>
            <DialogDescription>
              Choose how you would like to sign this document.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={signatureType} onValueChange={(v) => setSignatureType(v as "draw" | "upload")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="draw">Draw Signature</TabsTrigger>
              <TabsTrigger value="upload">Upload Signed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="draw" className="space-y-4 py-4">
              <div className="border-2 border-dashed rounded-lg p-1 bg-white">
                <canvas
                  ref={canvasRef}
                  className="w-full h-40 cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Draw your signature above</span>
                <button onClick={clearSignature} className="text-red-500 hover:underline">
                  Clear
                </button>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 py-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                <Icons.Import size={32} className="mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Click to upload signed PDF</p>
                <p className="text-xs text-muted-foreground mt-1">Max file size: 10MB</p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSign} disabled={signatureType === "draw" && !hasSignature}>
              Sign Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
