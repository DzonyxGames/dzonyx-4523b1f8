import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, AlertTriangle, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

const BANK_ACCOUNT = 'RS35170001089853000194';
const PRESET_AMOUNTS = [1, 5, 10, 25, 50, 100];

const Donations = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [copied, setCopied] = useState(false);

  const copyAccount = () => {
    navigator.clipboard.writeText(BANK_ACCOUNT);
    setCopied(true);
    toast.success('Bank account copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const amount = customAmount ? parseFloat(customAmount) : selectedAmount;

  return (
    <div className="min-h-screen pt-24 px-4 max-w-2xl mx-auto pb-20">
      <h1 className="text-4xl font-bold text-center mb-4 horror-glow" style={{ fontFamily: 'Creepster, cursive' }}>
        <Heart className="inline w-10 h-10 mr-2" /> Support Dzonyx
      </h1>
      <p className="text-center text-muted-foreground mb-12">Help us create more horror experiences</p>

      <div className="bg-card rounded-lg p-8 horror-border space-y-8">
        {/* Amount selection */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Choose an amount (EUR)</h3>
          <div className="grid grid-cols-3 gap-3">
            {PRESET_AMOUNTS.map(a => (
              <Button
                key={a}
                variant={selectedAmount === a && !customAmount ? 'default' : 'outline'}
                className="horror-border hover-horror text-lg py-6"
                onClick={() => { setSelectedAmount(a); setCustomAmount(''); }}
              >
                €{a}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom amount */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Or enter a custom amount</h3>
          <div className="flex gap-2">
            <span className="flex items-center text-muted-foreground text-lg">€</span>
            <Input
              type="number"
              min="1"
              placeholder="Any amount"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
              className="bg-muted border-border text-lg"
            />
          </div>
        </div>

        {/* Bank info */}
        <div className="bg-muted rounded-lg p-6 space-y-3">
          <h3 className="font-medium text-foreground">Bank Transfer Details</h3>
          {amount && amount > 0 && (
            <p className="text-primary font-bold text-xl">Amount: €{amount}</p>
          )}
          <div className="flex items-center gap-2">
            <code className="bg-background px-3 py-2 rounded text-sm text-foreground flex-1 font-mono">
              {BANK_ACCOUNT}
            </code>
            <Button variant="outline" size="icon" onClick={copyAccount} className="horror-border">
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Transfer the selected amount to this bank account</p>
        </div>

        {/* Warning */}
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">All donations are final. No refunds.</p>
            <p className="text-xs text-muted-foreground mt-1">
              By donating, you agree that the contribution is voluntary and non-refundable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donations;
