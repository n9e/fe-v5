import React from 'react';
import Detail from '@/pages/dashboard/Detail/Detail';
import { useTranslation } from "react-i18next";
export default function index() {
  const {
    t
  } = useTranslation();
  return <Detail isPreview />;
}