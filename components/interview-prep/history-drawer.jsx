'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Calendar, HelpCircle, ArrowRight, BookOpen } from 'lucide-react';

export function HistoryDrawer({ isOpen, onClose, sessions = [], onSelectSession }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border/60 backdrop-blur-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-violet-500 text-xs font-semibold uppercase tracking-wider">
            <History className="h-4 w-4" /> Session Vault
          </div>
          <DialogTitle className="text-xl font-extrabold tracking-tight">
            Previous AI Interview Sessions
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Reopen or continue previous AI-generated interview question sessions from your history.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-3">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs font-medium border border-dashed rounded-xl p-6">
              <HelpCircle className="h-8 w-8 text-violet-500 mx-auto mb-2" />
              No saved interview sessions yet. Click &quot;Generate Custom Interview&quot; to start a new session!
            </div>
          ) : (
            sessions.map((s, idx) => (
              <div
                key={s.id || idx}
                className="p-4 rounded-xl bg-card border border-border/60 hover:border-violet-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/30 text-xs font-bold">
                      {s.role}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {s.technology}
                    </Badge>
                    <Badge variant="secondary" className="text-[11px]">
                      {s.difficulty}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-2 pt-1 font-mono">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {new Date(s.createdAt).toLocaleDateString()} — {s.questions?.length || s.numberOfQuestions || 0}{' '}
                    Questions
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => {
                    onSelectSession(s);
                    onClose();
                  }}
                  className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shrink-0"
                >
                  <BookOpen className="mr-1.5 h-3.5 w-3.5" /> Reopen Session
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
