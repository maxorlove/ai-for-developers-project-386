import "@typespec/http";

using TypeSpec.Http;

@service(#{ title: "Календарь звонков" })
@server("/", "Текущий сайт")
namespace Calendar;

model EventType {
  @pattern("^[a-z0-9]+(-[a-z0-9]+)*$")
  id: string;

  @pattern("\\S")
  title: string;

  @pattern("\\S")
  description: string;

  @minValue(1)
  @maxValue(540)
  durationMinutes: int32;
}

model CreatedEventTypeResponse extends CreatedResponse {
  @body body: EventType;
}

model ValidationError {
  code: "validation_error";
  message: string;
}

@error
model ValidationErrorResponse extends BadRequestResponse {
  @body body: ValidationError;
}

model EventTypeExistsError {
  code: "event_type_exists";
  message: string;
}

@error
model EventTypeExistsResponse extends ConflictResponse {
  @body body: EventTypeExistsError;
}

@post
@route("/api/event-types")
op createEventType(@body eventType: EventType): CreatedEventTypeResponse | ValidationErrorResponse | EventTypeExistsResponse;

@get
@route("/api/event-types")
op getEventTypes(): EventType[];
