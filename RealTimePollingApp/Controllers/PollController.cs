using Microsoft.AspNetCore.Mvc;
using RealTimePollingApp.Models;
using System.Collections.Generic;
using System.Linq;

[Route("api/[controller]")]
[ApiController]
public class PollController : ControllerBase
{
    // In-memory koleksiyonlar
    private static List<Poll> Polls = new List<Poll>();
    private static List<Vote> Votes = new List<Vote>();

    // Anketleri listeleme
    [HttpGet]
    public IActionResult GetPolls() 
    {
        return Ok(Polls);
    }

    // Yeni anket oluşturma
    [HttpPost]
    public IActionResult CreatePoll([FromBody] Poll poll)
    {
        poll.Id = Polls.Count + 1; // Anket için benzersiz ID atama
        Polls.Add(poll);
        return Ok(poll);
    }

    // Belirli bir ankete oy verme
    [HttpPost("{pollId}/vote")]
    public IActionResult Vote(int pollId, [FromBody] string selectedOption)
    {
        var poll = Polls.FirstOrDefault(p => p.Id == pollId);
        if (poll == null || !poll.Options.Contains(selectedOption))
        {
            return BadRequest("Invalid poll or option.");
        }

        Votes.Add(new Vote { PollId = pollId, SelectedOption = selectedOption });
        return Ok();
    }

    // Anket sonuçlarını getirme
    [HttpGet("{pollId}/results")]
    public IActionResult GetResults(int pollId)
    {
        var poll = Polls.FirstOrDefault(p => p.Id == pollId);
        if (poll == null)
        {
            return NotFound();
        }

        // Seçeneklere göre oyları gruplandırarak sonuçları oluştur
        var results = Votes
            .Where(v => v.PollId == pollId)
            .GroupBy(v => v.SelectedOption)
            .Select(g => new
            {
                Option = g.Key,
                Count = g.Count()
            });

        return Ok(results);
    }
}
