import {
  Button,
  Card,
  Chip,
  Input,
  Modal,
  SectionHeader,
  Select,
  Spinner,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { EMERGENCY_NUMBERS } from "@/data/sriLankaData";
import { ALLERGENS, DIET_OPTIONS } from "@/lib/aiEngine";
import type { EmergencyContact } from "@/lib/supabase";
import {
  AlertTriangle,
  Bell,
  Check,
  Globe,
  Leaf,
  LogOut,
  Phone,
  Plus,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { useState } from "react";

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "India",
  "Australia",
  "Canada",
  "Germany",
  "France",
  "Japan",
  "China",
  "Other",
];
const LANGS = [
  { code: "en", label: "English" },
  { code: "si", label: "Sinhala" },
  { code: "ta", label: "Tamil" },
];

export function ProfileScreen() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showDiet, setShowDiet] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save(patch: any) {
    setBusy(true);
    await updateProfile(patch);
    setBusy(false);
    setEditing(false);
  }

  return (
    <div className="screen max-w-md mx-auto px-4 pt-4">
      <SectionHeader
        title="Profile & Settings"
        subtitle="Account, contacts, and safety preferences"
        icon={<UserIcon size={22} />}
      />

      {/* Account card */}
      <Card className="mb-4">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg overflow-hidden">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              (profile?.full_name || user?.email || "U").charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 truncate">
              {profile?.full_name || "Traveler"}
            </p>
            <p className="text-sm muted truncate">{user?.email}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Chip color="green">
                <Check size={10} /> Verified
              </Chip>
              {profile?.country_of_origin && (
                <Chip color="blue">{profile.country_of_origin}</Chip>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          full
          className="mt-4"
          onClick={() => setEditing(true)}
        >
          <UserIcon size={15} /> Edit profile
        </Button>
      </Card>

      {/* Emergency contacts */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Phone size={18} className="text-danger-600" />
            <p className="font-semibold">Emergency contacts</p>
          </div>
          <span className="text-xs muted">
            {profile?.emergency_contacts?.length ?? 0} saved
          </span>
        </div>
        {(profile?.emergency_contacts?.length ?? 0) === 0 ? (
          <p className="text-sm muted mb-3">
            No contacts yet. Add people to alert during an SOS.
          </p>
        ) : (
          <div className="space-y-2 mb-3">
            {profile?.emergency_contacts?.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 bg-slate-50 rounded-xl p-3"
              >
                <div className="h-9 w-9 rounded-full bg-danger-100 flex items-center justify-center text-danger-700 font-semibold">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-800 truncate">
                    {c.name}
                  </p>
                  <p className="text-xs muted">
                    {c.relationship} · {c.phone}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <Button full onClick={() => setShowContacts(true)}>
          <Plus size={16} /> Manage contacts
        </Button>
      </Card>

      {/* Dietary & allergens */}
      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Leaf size={18} className="text-brand-600" />
          <p className="font-semibold">Diet & allergens</p>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(profile?.dietary_restrictions?.length ?? 0) === 0 &&
          (profile?.allergies?.length ?? 0) === 0 ? (
            <p className="text-sm muted">No restrictions configured.</p>
          ) : (
            <>
              {(profile?.dietary_restrictions ?? []).map((d) => (
                <Chip key={d} color="green">
                  <Leaf size={11} /> {d}
                </Chip>
              ))}
              {(profile?.allergies ?? []).map((a) => (
                <Chip key={a} color="red">
                  <AlertTriangle size={11} /> {a.replace("_", " ")}
                </Chip>
              ))}
            </>
          )}
        </div>
        <Button variant="outline" full onClick={() => setShowDiet(true)}>
          Edit dietary rules
        </Button>
      </Card>

      {/* Language preference */}
      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe size={18} className="text-ocean-600" />
          <p className="font-semibold">Language preference</p>
        </div>
        <Select
          value={profile?.language_preference ?? "en"}
          onChange={async (e) => {
            await updateProfile({ language_preference: e.target.value });
          }}
        >
          {LANGS.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </Select>
      </Card>

      {/* Emergency numbers */}
      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell size={18} className="text-danger-600" />
          <p className="font-semibold">Sri Lanka emergency numbers</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {EMERGENCY_NUMBERS.map((n) => (
            <a
              key={n.number}
              href={`tel:${n.number}`}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 rounded-xl px-3 py-2.5 transition"
            >
              <Phone size={15} className="text-danger-600" />
              <div className="leading-tight">
                <p className="font-bold text-slate-800">{n.number}</p>
                <p className="text-xs muted">{n.label}</p>
              </div>
            </a>
          ))}
        </div>
      </Card>

      {/* Sign out */}
      <button
        onClick={signOut}
        className="btn-outline w-full py-3 text-danger-600 hover:bg-danger-50 hover:border-danger-200"
      >
        <LogOut size={16} /> Sign out
      </button>

      <p className="text-center text-xs muted mt-6 mb-2">
        SafeTrail AI · Smart Tourism Safety · Sri Lanka
      </p>

      {/* Edit profile modal */}
      <EditProfileModal
        open={editing}
        onClose={() => setEditing(false)}
        busy={busy}
        onSave={save}
      />

      {/* Contacts modal */}
      <ContactsModal
        open={showContacts}
        onClose={() => setShowContacts(false)}
      />

      {/* Diet modal */}
      <DietModal open={showDiet} onClose={() => setShowDiet(false)} />
    </div>
  );
}

function EditProfileModal({
  open,
  onClose,
  busy,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  busy: boolean;
  onSave: (patch: any) => void;
}) {
  const { profile } = useAuth();
  const [name, setName] = useState(profile?.full_name ?? "");
  const [country, setCountry] = useState(profile?.country_of_origin ?? "");

  return (
    <Modal open={open} onClose={onClose} title="Edit profile">
      <div className="space-y-3">
        <Input
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
        <Select
          label="Country of origin"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="">Select country</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Button
          full
          onClick={() =>
            onSave({ full_name: name, country_of_origin: country })
          }
          disabled={busy}
        >
          {busy ? (
            <Spinner size={16} />
          ) : (
            <>
              <Check size={16} /> Save changes
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
}

function ContactsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { profile, updateProfile } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>(
    profile?.emergency_contacts ?? [],
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("Family");
  const [saving, setSaving] = useState(false);

  function add() {
    if (!name.trim() || !phone.trim()) return;
    setContacts((c) => [
      ...c,
      { id: crypto.randomUUID(), name, phone, relationship },
    ]);
    setName("");
    setPhone("");
    setRelationship("Family");
  }

  function remove(id: string) {
    setContacts((c) => c.filter((x) => x.id !== id));
  }

  async function save() {
    setSaving(true);
    await updateProfile({ emergency_contacts: contacts });
    setSaving(false);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Emergency contacts" size="md">
      <div className="space-y-3">
        <div className="space-y-2">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 bg-slate-50 rounded-xl p-2.5"
            >
              <div className="h-8 w-8 rounded-full bg-danger-100 flex items-center justify-center text-danger-700 font-semibold text-sm">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {c.name}
                </p>
                <p className="text-xs muted">
                  {c.relationship} · {c.phone}
                </p>
              </div>
              <button
                onClick={() => remove(c.id)}
                className="text-slate-400 hover:text-danger-600 p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 pt-3">
          <p className="label">Add new contact</p>
          <div className="space-y-2">
            <Input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
              >
                {[
                  "Family",
                  "Friend",
                  "Partner",
                  "Spouse",
                  "Colleague",
                  "Other",
                ].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </Select>
            </div>
            <Button variant="ghost" full onClick={add}>
              <Plus size={16} /> Add contact
            </Button>
          </div>
        </div>

        <Button full onClick={save} disabled={saving}>
          {saving ? (
            <Spinner size={16} />
          ) : (
            <>
              <Check size={16} /> Save contacts
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
}

function DietModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile, updateProfile } = useAuth();
  const [allergens, setAllergens] = useState<string[]>(
    profile?.allergies ?? [],
  );
  const [diet, setDiet] = useState<string[]>(
    profile?.dietary_restrictions ?? [],
  );
  const [saving, setSaving] = useState(false);

  function toggle(list: string[], item: string) {
    return list.includes(item)
      ? list.filter((x) => x !== item)
      : [...list, item];
  }

  async function save() {
    setSaving(true);
    await updateProfile({ allergies: allergens, dietary_restrictions: diet });
    setSaving(false);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Dietary rules & allergens"
      size="md"
    >
      <div className="space-y-4">
        <div>
          <p className="label">Dietary preferences</p>
          <div className="flex flex-wrap gap-2">
            {DIET_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDiet((l) => toggle(l, d))}
                className={`chip capitalize ${diet.includes(d) ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                <Leaf size={12} /> {d}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="label">Allergens to avoid</p>
          <div className="flex flex-wrap gap-2">
            {ALLERGENS.map((a) => (
              <button
                key={a}
                onClick={() => setAllergens((l) => toggle(l, a))}
                className={`chip capitalize ${allergens.includes(a) ? "bg-danger-600 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                <AlertTriangle size={12} /> {a.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
        <Button full onClick={save} disabled={saving}>
          {saving ? (
            <Spinner size={16} />
          ) : (
            <>
              <Check size={16} /> Save rules
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
}
