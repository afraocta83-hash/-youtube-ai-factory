import { SpanStatusCode, trace } from "@opentelemetry/api";

type Attribute = string | number | boolean;

export async function withAgentSpan<T>(
  name: string,
  attributes: Record<string, Attribute>,
  operation: () => Promise<T>
): Promise<T> {
  const tracer = trace.getTracer("lerry-agent-pipeline", "1.0.0");
  return tracer.startActiveSpan(name, async (span) => {
    for (const [key, value] of Object.entries(attributes)) {
      span.setAttribute(key, value);
    }
    try {
      const result = await operation();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown agent error";
      span.recordException(error instanceof Error ? error : new Error(message));
      span.setStatus({ code: SpanStatusCode.ERROR, message });
      throw error;
    } finally {
      span.end();
    }
  });
}
