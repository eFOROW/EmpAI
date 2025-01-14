export interface VideoAnalysis {
  video_number: number;
  video_filename: string;
  question: string;
  답변: string | null;
  ["감정_%"]: {
    Angry: number;
    Disgust: number;
    Fear: number;
    Happy: number;
    Sad: number;
    Surprise: number;
    Neutral: number;
  } | null;
  ["머리기울기_%"]: {
    center: number;
    right: number;
    left: number;
  } | null;
  ["아이트래킹_%"]: {
    center: number;
    right: number;
    left: number;
    blink: number;
  } | null;
  말하기속도: number | null;
  평속대비차이: number | null;
  추임새갯수: number | null;
  침묵갯수: number | null;
  목소리변동성: string | null;
  ["음성높낮이_%"]: number | null;
  답변강점?: string;
  답변개선사항?: string;
  답변종합평가?: string;
  Score: {
    말하기속도: number;
    "추임새/침묵": number;
    목소리변동성: number;
    표정분석: number;
    머리기울기: number;
    시선분석: number;
    답변평가: number;
  };
  Evaluation: {
    답변강점: string;
    답변개선사항: string;
    답변종합평가: string;
  };
}

export interface Analysis {
  _id: { $oid: string };
  uid: string;
  self_id: string;
  title: string;
  job_code: string;
  time: string;
  [key: string]: any;
}

export interface ResultModalProps {
  visible: boolean;
  onClose: () => void;
  analysis: Analysis | null;
} 