create table if not exists treatwell_sync_log (
  id                uuid primary key default gen_random_uuid(),
  gmail_message_id  text unique not null,
  raw_subject       text,
  parsed_start      timestamptz,
  parsed_end        timestamptz,
  calcom_booking_uid text,
  status            text not null, -- 'synced' | 'parse_error' | 'calcom_error'
  error_message     text,
  created_at        timestamptz default now()
);
