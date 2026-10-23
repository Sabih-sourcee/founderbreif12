import { useState } from "react";
import { Bell, Download, Folder, HelpCircle, MessageCircle, Mic, User, Volume2, ChevronRight } from "lucide-react";
import {
  ActionTile,
  CircleButton,
  ListRow,
  RowLeading,
  ScreenFrame,
  Sheet,
  Tap,
} from "../kit";
import { ProfileSheet } from "../components/ProfileSheet";
import { TabId } from "../types";
import { firstName } from "../text";
import { COLORS } from "../theme";

export interface AppNotification {
  id: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

const HOW_IT_WORKS = [
  { icon: Mic, title: "Record your idea", text: "Speak or type it. Pick a language and a document." },
  { icon: MessageCircle, title: "Answer 7 questions", text: "Quick calibration so the document is specific to you." },
  { icon: Download, title: "Export or listen", text: "Save as Word, PDF or TXT, or have it read aloud." },
];

export function HomeScreen({
  name,
  notifications,
  needsProfile,
  onSaveProfile,
  onSkipProfile,
  onNavigate,
}: {
  name: string;
  notifications: AppNotification[];
  needsProfile: boolean;
  onSaveProfile: (name: string, email: string) => void;
  onSkipProfile: () => void;
  onNavigate: (tab: TabId) => void;
}) {
  const [bellOpen, setBellOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const who = firstName(name) || "there";

  return (
    <ScreenFrame>
      <div className="fb-home-top">
        <CircleButton onPress={() => setHelpOpen(true)} accessibilityLabel="Help">
          <HelpCircle size={24} color={COLORS.ink} />
        </CircleButton>
        <CircleButton
          onPress={() => setBellOpen(true)}
          dot={notifications.length > 0}
          accessibilityLabel="Notifications"
        >
          <Bell size={23} color={COLORS.ink} />
        </CircleButton>
      </div>

      <div className="fb-scroll">
        <h1 className="fb-greeting">{`Hi ${who},\nReady to build\nsomething?`}</h1>
        <div className="fb-grid">
          <div className="fb-grid-row">
            <ActionTile label="Record" tinted onPress={() => onNavigate("Record")}>
              <Mic size={46} color={COLORS.ink} strokeWidth={1.5} />
            </ActionTile>
            <ActionTile label="Read Aloud" onPress={() => onNavigate("ReadAloud")}>
              <Volume2 size={46} color={COLORS.ink} strokeWidth={1.5} />
            </ActionTile>
          </div>
          <div className="fb-grid-row">
            <ActionTile label="Library" onPress={() => onNavigate("Library")}>
              <Folder size={46} color={COLORS.ink} strokeWidth={1.5} />
            </ActionTile>
            <ActionTile label="Profile" tinted onPress={() => onNavigate("Profile")}>
              <User size={46} color={COLORS.ink} strokeWidth={1.5} />
            </ActionTile>
          </div>
        </div>
      </div>

      <Sheet visible={bellOpen} onClose={() => setBellOpen(false)}>
        <div className="fb-sheet-title">Notifications</div>
        {notifications.length === 0 ? (
          <p className="fb-empty-copy">You're all caught up.</p>
        ) : (
          notifications.map((n) => (
            <ListRow
              key={n.id}
              leading={
                <RowLeading tone="accent">
                  <Bell size={20} color={COLORS.ink} />
                </RowLeading>
              }
              title={n.title}
              subtitle={n.subtitle}
              onPress={() => {
                setBellOpen(false);
                n.onPress();
              }}
            />
          ))
        )}
      </Sheet>

      <Sheet visible={helpOpen} onClose={() => setHelpOpen(false)}>
        <div className="fb-sheet-title">How FounderBrief works</div>
        {HOW_IT_WORKS.map((step, i) => (
          <div key={step.title} className="fb-help-row">
            <RowLeading tone="accent" size={42}>
              <step.icon size={20} color={COLORS.ink} />
            </RowLeading>
            <div style={{ flex: 1, marginLeft: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{`${i + 1}. ${step.title}`}</div>
              <div style={{ fontSize: 13, lineHeight: "18px", color: COLORS.inkMuted, marginTop: 2 }}>{step.text}</div>
            </div>
          </div>
        ))}
        <Tap
          onPress={() => {
            setHelpOpen(false);
            onNavigate("Profile");
          }}
          className="fb-help-link"
        >
          <span style={{ fontWeight: 700, fontSize: 14 }}>More help in Profile</span>
          <ChevronRight size={18} color={COLORS.ink} />
        </Tap>
      </Sheet>

      <ProfileSheet
        visible={needsProfile}
        title="Welcome to FounderBrief"
        subtitle="What should we call you? This personalises your Home screen and Profile."
        initialName=""
        initialEmail=""
        saveLabel="Continue"
        onSave={onSaveProfile}
        onSkip={onSkipProfile}
        onClose={onSkipProfile}
      />
    </ScreenFrame>
  );
}
