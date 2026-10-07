// src/hooks/usePolicy.ts
import { useEffect, useState } from 'react';
import { getPolicyAcceptance, POLICY_VERSION } from '../lib/policy';
import { useNavigation } from '@react-navigation/native';

export const usePolicy = () => {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const check = async () => {
      const acceptance = await getPolicyAcceptance();
      if (!acceptance || acceptance.version !== POLICY_VERSION) {
        navigation.reset({ index: 0, routes: [{ name: 'Policy' }] });
      }
      setLoading(false);
    };
    check();
  }, []);

  return { loading };
};
