export type InquiryType = 'tour' | 'appointment' | 'question';

export interface InquiryRequest {
  propertyId: string;
  type:       InquiryType;
  name:       string;
  email:      string;
  phoneNumber:      string;
  message:    string;
}

export interface InquiryResponse {
  success: boolean;
  message: string;
  data: {
    inquiryId: string;
  };
}
