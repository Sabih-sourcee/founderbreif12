import { useEffect, useState } from "react";
import { Button, Sheet, Tap } from "../kit";
import { COLORS } from "../theme";

export function ProfileSheet({
  visible,
  title,
  subtitle,
  initialName,
  initialEmail,
  saveLabel = "Save",
  onSave,
  onSkip,
  onClose,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  initialName: string;
  initialEmail: string;
  saveLabel?: string;
  onSave: (name: string, email: string) => void;
  onSkip?: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setEmail(initialEmail);
    }
  }, [visible, initialName, initialEmail]);

  return (
    <Sheet visible={visible} onClose={onSkip ?? onClose}>
      <div className="fb-sheet-title">{title}</div>
      {subtitle ? <p className="fb-sheet-sub">{subtitle}</p> : <div style={{ height: 14 }} />}
      <div className="fb-field">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoCapitalize="words" />
      </div>
      <div className="fb-field">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (optional)"
          autoCapitalize="none"
          type="email"
        />
      </div>
      <Button
        label={saveLabel}
        disabled={name.trim().length === 0}
        onPress={() => onSave(name.trim(), email.trim())}
      />
      {onSkip ? (
        <Tap onPress={onSkip} className="fb-skip-link">
          <span style={{ fontWeight: 500, fontSize: 14, color: COLORS.inkMuted }}>Not now</span>
        </Tap>
      ) : null}
    </Sheet>
  );
}
