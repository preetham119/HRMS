declare module '@/components/appraisal-system/AppraisalApp' {
  import type { ComponentType } from 'react';

  type AppraisalAppProps = {
    user?: Record<string, unknown>;
  };

  const AppraisalApp: ComponentType<AppraisalAppProps>;
  export default AppraisalApp;
}
