import { useState } from "react";
import { Download, Globe, HelpCircle, LogIn, LogOut, Volume2 } from "lucide-react";
import {
  ActionSheet,
  Avatar,
  Button,
  Card,
  MenuRow,
  ProgressBar,
  ScreenFrame,
  ScreenTitle,
  SegmentedToggle,
  Sheet,
  Tap,
} from "../kit";
import { ProfileSheet } from "../components/ProfileSheet";
import { ExportDocFormat, SPOKEN_LANGUAGES, UserPreferences, UserProfile } from "../types";
import { COLORS } from "../theme";

type SheetId = "edit" | "signin" | "language" | "export" | "help" | null;

export function ProfileScreen({
  profile,
  isPro,
  usage,
  prefs,
  onPrefsChange,
  onSaveProfile,
  onSignIn,
  onLogout,
  onUpgrade,
  onManageSubscription,
  onRestore,
  onOpenVoiceSettings,
  onClearData,
}: {
  profile: UserProfile;
  isPro: boolean;
  usage: { used: number; limit: number | null };
  prefs: UserPreferences;
  onPrefsChange: (prefs: UserPreferences) => void;
  onSaveProfile: (name: string, email: string) => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onLogout: () => void;
  onUpgrade: () => void;
  onManageSubscription: () => void;
  onRestore: () => Promise<void>;
  onOpenVoiceSettings: () => void;
  onClearData: () => void;
}) {
  const [sheet, setSheet] = useState<SheetId>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const close = () => setSheet(null);
  const hasName = profile.name.trim().length > 0;
  const unlimited = isPro || usage.limit === null;
  const progress = unlimited ? 1 : usage.limit ? usage.used / usage.limit : 0;

  const signIn = async () => {
    if (signingIn) return;
    setSigningIn(true);
    setSignInError("");
    try {
      await onSignIn(email.trim(), password);
      setPassword("");
      close();
    } catch (e) {
      setSignInError(e instanceof Error ? e.message : "Couldn't sign in.");
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <ScreenFrame>
      <ScreenTitle title="Profile" />
      <div className="fb-scroll" style={{ paddingBottom: 12 }}>
        <Tap onPress={() => setSheet("edit")} className="fb-identity" accessibilityLabel="Edit profile">
          <Avatar name={profile.name} uri={profile.avatarUrl} size={98} />
          <div className="fb-identity-name">{hasName ? profile.name : "Add your name"}</div>
          <div className="fb-identity-email">{profile.email || "Add your email"}</div>
        </Tap>

        <Card>
          <div className="fb-plan-label">Current Plan</div>
          <div className="fb-plan-name">{isPro ? "Pro Plan" : "Free Plan"}</div>
          <ProgressBar progress={progress} height={10} className="fb-mt-14" />
          <p className="fb-plan-usage">
            {unlimited
              ? "Unlimited documents and read-alouds"
              : `${usage.used} of ${usage.limit} used this month`}
          </p>
          <Button
            label={isPro ? "Manage Subscription" : "Upgrade to Pro"}
            variant="dark"
            onPress={isPro ? onManageSubscription : onUpgrade}
            className="fb-mt-18"
          />
        </Card>

        <div style={{ marginTop: 20 }}>
          <MenuRow
            icon={<Globe size={21} color={COLORS.ink} />}
            label="Language Preferences"
            right={prefs.language}
            onPress={() => setSheet("language")}
          />
          <MenuRow
            icon={<Volume2 size={21} color={COLORS.ink} />}
            label="Voice Settings"
            onPress={onOpenVoiceSettings}
          />
          <MenuRow
            icon={<Download size={21} color={COLORS.ink} />}
            label="Export Defaults"
            right={prefs.docFormat}
            onPress={() => setSheet("export")}
          />
          <MenuRow
            icon={<HelpCircle size={21} color={COLORS.ink} />}
            label="Help & Support"
            onPress={() => setSheet("help")}
          />
          {profile.isLoggedIn ? (
            <MenuRow
              icon={<LogOut size={21} color={COLORS.ink} />}
              label="Log out"
              onPress={() => {
                if (window.confirm("Log out? Your Library stays on this device.")) onLogout();
              }}
            />
          ) : (
            <MenuRow
              icon={<LogIn size={21} color={COLORS.ink} />}
              label="Sign in"
              onPress={() => setSheet("signin")}
            />
          )}
        </div>
      </div>

      <ProfileSheet
        visible={sheet === "edit"}
        title="Edit profile"
        initialName={profile.name}
        initialEmail={profile.email}
        onSave={(n, e) => {
          onSaveProfile(n, e);
          close();
        }}
        onClose={close}
      />

      <Sheet visible={sheet === "signin"} onClose={close}>
        <div className="fb-sheet-title">Sign in</div>
        <p className="fb-sheet-sub">For FounderBrief team accounts.</p>
        <div className="fb-field">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
        </div>
        <div className="fb-field">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            onKeyDown={(e) => {
              if (e.key === "Enter") void signIn();
            }}
          />
        </div>
        {signInError ? <p className="fb-error">{signInError}</p> : null}
        <Button label="Sign in" loading={signingIn} disabled={!email.trim() || !password} onPress={() => void signIn()} />
      </Sheet>

      <ActionSheet
        visible={sheet === "language"}
        title="Language Preferences"
        onClose={close}
        options={SPOKEN_LANGUAGES.map((l) => ({
          label: l.label,
          icon: <Globe size={21} color={COLORS.ink} />,
          selected: prefs.language === l.id,
          onPress: () => onPrefsChange({ ...prefs, language: l.id }),
        }))}
      />

      <Sheet visible={sheet === "export"} onClose={close}>
        <div className="fb-sheet-title">Export Defaults</div>
        <p className="fb-sheet-sub">The format highlighted on a finished document.</p>
        <SegmentedToggle<ExportDocFormat>
          options={[
            { id: "Word", label: "Word" },
            { id: "PDF", label: "PDF" },
            { id: "TXT", label: "TXT" },
          ]}
          value={prefs.docFormat}
          onChange={(docFormat) => onPrefsChange({ ...prefs, docFormat })}
        />
      </Sheet>

      <Sheet visible={sheet === "help"} onClose={close}>
        <div className="fb-sheet-title">Help & Support</div>
        <p className="fb-empty-copy" style={{ marginBottom: 16 }}>
          Record or type your idea, answer the calibration questions, then export the document or have it read
          aloud. Free accounts can create 3 documents each month.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Button
            label="Restore purchases"
            variant="secondary"
            loading={restoring}
            onPress={async () => {
              setRestoring(true);
              try {
                await onRestore();
              } finally {
                setRestoring(false);
              }
            }}
          />
          <Button
            label="Clear local data"
            variant="dark"
            onPress={() => {
              if (window.confirm("This deletes your Library, preferences and profile from this device.")) {
                close();
                onClearData();
              }
            }}
          />
        </div>
      </Sheet>
    </ScreenFrame>
  );
}
