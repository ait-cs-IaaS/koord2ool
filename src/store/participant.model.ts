/**
 * This is a stub of the DTO returned by LimeSurvey when retrieving participants.
 */
export interface ParticipantModel {
  tid: string;

  token: string;

  participant_info: {
    firstname?: string;
    lastname?: string;
    email?: string;
  };

  /**
   * This is a catch-all property for past, present, or future use.
   * It may or may not actually exist, and its type is intrinsically unknown.
   */
  [other: string]: unknown;
}
