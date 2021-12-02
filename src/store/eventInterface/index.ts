import { RelativeRange } from '@/components/DateRangePicker';

export enum warningPriority {
  First = 1,
  Second = 2,
  Third = 3,
}

export enum warningStatus {
  Enable = 0,
  UnEnable = 1,
}

export enum IsRecovery {
  Alert = 0,
  Recovery = 1,
}

export enum warningLabel {
  Enable = '已触发',
  UnEnable = '已屏蔽',
}

export type warningEventItem = {
  id: number;
  rule_id: number; //int 策略id
  rule_name: string; //string 告警事件对应点策略名称
  rule_note: string; //string 告警事件对应点策略备注
  hash_id: string; // 告警事件唯一标识
  res_ident: string; // 资源的ident
  res_classpaths: string; //资源所属的classpaths
  priority: warningPriority; //int 告警级别 1->p1 2->p2 3->p3
  status: warningStatus; // int 枚举,标识是否 被屏蔽, 1已屏蔽 2已触犯
  is_recovery: IsRecovery; //int 枚举, 0: alert, 1: recovery
  history_points: Array<{
    metric: string;
    points: Array<{
      extra: string;
      t: number;
      v: number;
    }>;
    tags: { string: string };
  }>;
  is_prome_pull: number;
  trigger_time: number; //int 时间戳，单位秒
  values: string; // string, e.g. cpu.idle: 23.3; load.1min: 32
  notify_channels: string; //string 通知通道
  runbook_url: string; //string 预案链接
  readable_expression: string; // string 规则表达式 e.g. mem.bytes.used.percent(all,60s) > 0
  tags: string; // string 告警事件标签 merge data_tags rule_tags and res_tags
  notify_group_objs: any; //[]userGroup{} 见备注
  notify_user_objs: any; //[]user{} 见备注
};

export interface eventStoreState {
  currentEdit: warningEventItem | null;
  alertings: { ['index']?: number };
  severity: number | undefined;
  hourRange: RelativeRange;
  queryContent: string;
  hisSeverity: number | undefined;
  hisEventType: 0 | 1 | undefined;
  hisHourRange: RelativeRange;
  hisQueryContent: string;
}
