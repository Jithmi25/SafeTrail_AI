// Offline essential phrase dictionary for Sinhala/Tamil ↔ English.

export type Phrase = {
  id: string;
  category:
    | "medical"
    | "directional"
    | "police"
    | "food"
    | "emergency"
    | "greeting"
    | "shopping";
  en: string;
  si: string; // Sinhala script
  ta: string; // Tamil script
  siLatn: string; // Sinhala romanized pronunciation
  taLatn: string; // Tamil romanized pronunciation
};

export const PHRASES: Phrase[] = [
  {
    id: "ph1",
    category: "emergency",
    en: "Help! I need assistance.",
    si: "උදව්! මට උදව් කරන්න.",
    ta: "உதவி! எனக்கு உதவுங்கள்.",
    siLatn: "udawa! mata udawa karan.",
    taLatn: "udhavi! enakku udhaviyungal.",
  },
  {
    id: "ph2",
    category: "emergency",
    en: "Please call the police.",
    si: "කරුණාකර පොලිසියට අමතන්න.",
    ta: "தயவுசெய்து போலீஸை அழையுங்கள்.",
    siLatn: "karunakra polisiyata amathanna.",
    taLatn: "thayavu seithu policesai azhiyungal.",
  },
  {
    id: "ph3",
    category: "emergency",
    en: "I need an ambulance.",
    si: "මට රෝද රථයක් අවශ්‍යයි.",
    ta: "எனக்கு ஆம்புலன்ஸ் தேவை.",
    siLatn: "mata roda rathayak awashyai.",
    taLatn: "enakku ambulance thevai.",
  },
  {
    id: "ph4",
    category: "emergency",
    en: "I am lost. Where is my hotel?",
    si: "මම අතරමං වෙලා. මගේ හෝටලය කොහෙද?",
    ta: "நான் வழிதவறிவிட்டேன். என் ஹோட்டல் எங்கே?",
    siLatn: "mama atharaman wela. mage hotalaya koheda?",
    taLatn: "naan vazhi thavari vitten. en hotel engae?",
  },
  {
    id: "ph5",
    category: "medical",
    en: "I need a doctor.",
    si: "මට වෛද්‍යවරයෙක් අවශ්‍යයි.",
    ta: "எனக்கு ஒரு மருத்துவர் தேவை.",
    siLatn: "mata waidyavaryak awashyai.",
    taLatn: "enakku oru maruthuvar thevai.",
  },
  {
    id: "ph6",
    category: "medical",
    en: "I am allergic to peanuts.",
    si: "මට රාජා මැෂ් වලට අසාත්මත්වයක් තියෙනවා.",
    ta: "எனக்கு நிலக்கடலை ஒவ்வாமை உள்ளது.",
    siLatn: "mata raja mash walata asamthawathak tiyenawa.",
    taLatn: "enakku nilakkadale ovvamai ullathu.",
  },
  {
    id: "ph7",
    category: "medical",
    en: "Where is the hospital?",
    si: "රෝහල කොහෙද?",
    ta: "வைத்தியசாலை எங்கே?",
    siLatn: "rohala koheda?",
    taLatn: "vaithiyasalai engae?",
  },
  {
    id: "ph8",
    category: "medical",
    en: "I feel sick.",
    si: "මට අසනීපයි.",
    ta: "எனக்கு உடம்பு சுளுங்குது.",
    siLatn: "mata asaneepayi.",
    taLatn: "enakku udambu sulunguthu.",
  },
  {
    id: "ph9",
    category: "directional",
    en: "How do I get to the station?",
    si: "ස්ටේෂන් එකට යන්නේ කොහොමද?",
    ta: "நிலையத்திற்கு எப்படி போவது?",
    siLatn: "station ekata yanne kohomada?",
    taLatn: "nilayathirku eppadi pohvathu?",
  },
  {
    id: "ph10",
    category: "directional",
    en: "Turn left, please.",
    si: "කරුණාකර වමට හැරෙන්න.",
    ta: "தயவுசெய்து இடதுபுறம் திரும்புங்கள்.",
    siLatn: "karunakra vamata herenna.",
    taLatn: "thayavu seithu idhapuram thirumbungal.",
  },
  {
    id: "ph11",
    category: "directional",
    en: "How far is it?",
    si: "කොච්චර ඈතින්ද?",
    ta: "எவ்வளவு தூரம் இருக்கிறது?",
    siLatn: "kochchara aethinda?",
    taLatn: "evvalavu thooram irukkirathu?",
  },
  {
    id: "ph12",
    category: "police",
    en: "I want to report a crime.",
    si: "මම අපරාධයක් වාර්තා කරන්න ඕනේ.",
    ta: "நான் ஒரு குற்றத்தை புகார் செய்ய விரும்புகிறேன்.",
    siLatn: "mama aparadhayak wartha karanna one.",
    taLatn: "naan oru kuratthai pugaar seyya virumbukiren.",
  },
  {
    id: "ph13",
    category: "police",
    en: "Someone stole my bag.",
    si: "කෙනෙක් මගේ බෑගය හොරකෑවා.",
    ta: "யாரோ என் பையை திருடிவிட்டார்கள்.",
    siLatn: "kenak mage bagaya horakehwa.",
    taLatn: "yaaro en paiyai thirudi vittargal.",
  },
  {
    id: "ph14",
    category: "food",
    en: "Is this spicy?",
    si: "මේක කුළුබරද?",
    ta: "இது காரமாக உள்ளதா?",
    siLatn: "meka kuhubarada?",
    taLatn: "idhu kaaramaaga ullatha?",
  },
  {
    id: "ph15",
    category: "food",
    en: "Is this vegetarian?",
    si: "මේක එළවුළු ආහාරද?",
    ta: "இது சைவமா?",
    siLatn: "meka elawulu aharada?",
    taLatn: "idhu saivama?",
  },
  {
    id: "ph16",
    category: "food",
    en: "Does this contain peanuts?",
    si: "මේකේ රාජා මැෂ් තියෙනවද?",
    ta: "இதில் நிலக்கடலை உள்ளதா?",
    siLatn: "meke raja mash tiyenawada?",
    taLatn: "idhil nilakkadale ullatha?",
  },
  {
    id: "ph17",
    category: "food",
    en: "Is this halal?",
    si: "මේක හලාල්ද?",
    ta: "இது ஹலாலா?",
    siLatn: "meka halalda?",
    taLatn: "idhu halaala?",
  },
  {
    id: "ph18",
    category: "greeting",
    en: "Hello / How are you?",
    si: "ආයුබෝවන්. කොහොමද ඔයා?",
    ta: "வணக்கம். நீங்கள் எப்படி இருக்கிறீர்கள்?",
    siLatn: "ayubowan. kohomada oya?",
    taLatn: "vanakkam. neengal eppadi irukkireergal?",
  },
  {
    id: "ph19",
    category: "greeting",
    en: "Thank you very much.",
    si: "බොහොම ස්තූතියි.",
    ta: "மிக்க நன்றி.",
    siLatn: "bohoma sthuthiyi.",
    taLatn: "mikka nandri.",
  },
  {
    id: "ph20",
    category: "greeting",
    en: "Yes / No",
    si: "ඔව් / නැහැ",
    ta: "ஆம் / இல்லை",
    siLatn: "owa / naehe",
    taLatn: "aam / illai",
  },
  {
    id: "ph21",
    category: "shopping",
    en: "How much does this cost?",
    si: "මේකේ මිල කීයද?",
    ta: "இது எவ்வளவு?",
    siLatn: "meke mila kiyada?",
    taLatn: "idhu evvalavu?",
  },
  {
    id: "ph22",
    category: "shopping",
    en: "That is too expensive.",
    si: "ඒක ගොඩක් මිල වැඩියි.",
    ta: "அது மிகவும் விலை அதிகம்.",
    siLatn: "eka godak mila wadiyi.",
    taLatn: "adhu migavum vilai athigam.",
  },
  {
    id: "ph23",
    category: "shopping",
    en: "Can you lower the price?",
    si: "මිල අඩු කරන්න පුළුවන්ද?",
    ta: "விலையை குறைக்க முடியுமா?",
    siLatn: "mila adu karanna puluwanda?",
    taLatn: "vilaiyai kurakka mudiyuma?",
  },
];

export const PHRASE_CATEGORIES: { key: Phrase["category"]; label: string }[] = [
  { key: "emergency", label: "Emergency" },
  { key: "medical", label: "Medical" },
  { key: "police", label: "Police" },
  { key: "directional", label: "Directions" },
  { key: "food", label: "Food" },
  { key: "greeting", label: "Greeting" },
  { key: "shopping", label: "Shopping" },
];
