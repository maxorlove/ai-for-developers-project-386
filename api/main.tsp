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

@get
@route("/api/event-types")
op getEventTypes(): EventType[];
