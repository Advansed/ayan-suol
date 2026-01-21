// src/hooks/useAgreements.ts

import { loginActions, loginGetters, useLoginStore, useToken } from "../../../../Store/loginStore"
import { useSocket } from "../../../../Store/useSocket"

export const useAgreements = () => {
  const agreements  = useLoginStore(state => state.agreements)
  const isLoading   = useLoginStore(state => state.isLoading)
  const { emit }    = useSocket()
  const token       = useToken();

  const toggleAgreement = (agreementType: keyof typeof agreements) => {
    if (!isLoading) {

      loginActions.toggleAgreements( agreementType )

      emit("set_agreement", { token: token, [agreementType]: loginGetters.getAgreement( agreementType )})

    }
  }

  return {

    agreements, 
    isLoading,
    toggleAgreement,
    hasAgreement:       (agreementType: keyof typeof agreements) => agreements[agreementType],
    hasAllAgreements:   () => Object.values(agreements).every(Boolean),
    hasAnyAgreement:    () => Object.values(agreements).some(Boolean)

  }
}