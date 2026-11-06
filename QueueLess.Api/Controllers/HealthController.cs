using Microsoft.AspNetCore.Mvc;

namespace QueueLess.Api.Controllers;

[ApiController]
[Route("api/health")]
public sealed class HealthController : ControllerBase
{
    [HttpGet]
    public ActionResult<object> Get()
    {
        return Ok(new
        {
            service = "QueueLess API",
            status = "ready",
            phase = "frontend-mock"
        });
    }
}
