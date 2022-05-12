export interface ParticipantModel {
  tid: string;

  token: string;

  participant_info: {
    firstname?: string;
    lastname?: string;
    email?: string;
  };

  [other: string]: unknown;
}
