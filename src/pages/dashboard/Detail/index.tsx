import React from 'react';
import Detail from './Detail';
import { useTranslation } from "react-i18next";
export default function index2() {
  const {
    t
  } = useTranslation();
  return <Detail />;
}