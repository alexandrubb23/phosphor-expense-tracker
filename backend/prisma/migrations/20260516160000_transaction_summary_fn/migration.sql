-- Stored function: get_transaction_summary
-- Computes all dashboard KPIs in a single table scan via a CTE.
--
-- Parameters:
--   p_user_id      – the authenticated user's ID
--   p_date_gte     – start of the selected period (inclusive)
--   p_date_lte     – end of the selected period (inclusive)
--   p_ai_user_id   – the deterministic AI system-user ID

CREATE OR REPLACE FUNCTION get_transaction_summary(
  p_user_id     TEXT,
  p_date_gte    TIMESTAMPTZ,
  p_date_lte    TIMESTAMPTZ,
  p_ai_user_id  TEXT
)
RETURNS TABLE (
  total_inflow       NUMERIC,
  total_outflow      NUMERIC,
  by_category        JSONB,
  total_count        BIGINT,
  inflow_count       BIGINT,
  outflow_count      BIGINT,
  ai_resolved_count  BIGINT,
  avg_resolution_ms  DOUBLE PRECISION
)
LANGUAGE sql
STABLE
AS $$
  WITH base AS (
    SELECT *
    FROM "transaction"
    WHERE "userId"    = p_user_id
      AND "deletedAt" IS NULL
      AND "date"      >= p_date_gte
      AND "date"      <= p_date_lte
  ),
  cat_sums AS (
    SELECT
      jsonb_agg(
        jsonb_build_object('category', category, 'total', total)
        ORDER BY total DESC
      ) AS by_category
    FROM (
      SELECT category, SUM(amount) AS total
      FROM base
      WHERE "operationType" = 'Outflow'
      GROUP BY category
    ) x
  )
  SELECT
    COALESCE(SUM(amount) FILTER (WHERE "operationType" = 'Inflow'),  0)  AS total_inflow,
    COALESCE(SUM(amount) FILTER (WHERE "operationType" = 'Outflow'), 0)  AS total_outflow,
    COALESCE((SELECT by_category FROM cat_sums), '[]'::jsonb)            AS by_category,
    COUNT(*)                                                             AS total_count,
    COUNT(*) FILTER (WHERE "operationType" = 'Inflow')                   AS inflow_count,
    COUNT(*) FILTER (WHERE "operationType" = 'Outflow')                  AS outflow_count,
    COUNT(*) FILTER (WHERE "resolvedByUserId" = p_ai_user_id)            AS ai_resolved_count,
    AVG(
      EXTRACT(EPOCH FROM ("updatedAt" - "createdAt")) * 1000
    ) FILTER (WHERE "resolvedByUserId" = p_ai_user_id)                   AS avg_resolution_ms
  FROM base
$$;
