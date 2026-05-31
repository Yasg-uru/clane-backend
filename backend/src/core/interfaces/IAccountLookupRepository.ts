/**
 * Cross-aggregate identity lookups that span both the Brand and Creator
 * collections. Centralised here so neither role repository has to reach into
 * the other's model.
 */
export interface IAccountLookupRepository {
  emailExistsAcrossRoles(email: string): Promise<boolean>;
}
