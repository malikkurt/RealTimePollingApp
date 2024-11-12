using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealTimePollingApp.Data;
using RealTimePollingApp.Models;
using System.Collections.Generic;
using System.Linq;

[Route("api/[controller]")]
[ApiController]
public class PollController : ControllerBase
{
    private PollDbContext _context { get; set; }

    public PollController(PollDbContext context)
    {
        _context = context;
    }

    // In-memory koleksiyonlar
    private static List<Poll> Polls = new List<Poll>();
    private static List<Vote> Votes = new List<Vote>();

    // Anketleri listeleme
    [HttpGet]
    public async Task<IActionResult> GetPolls()
    {
        var polls = await _context.Polls.ToListAsync();
        return Ok(polls);
    }

    // Yeni anket oluşturma
    [HttpPost]
    public async Task<IActionResult> CreatePoll([FromBody] Poll poll)
    {
        _context.Polls.Add(poll);
        await _context.SaveChangesAsync();
        return Ok(poll);
    }

    // Belirli bir ankete oy verme
    [HttpPost("{pollId}/vote")]
    public async Task<IActionResult> Vote(int pollId, [FromBody] string selectedOption)
    {
        var poll = await _context.Polls.FindAsync(pollId);
        if (poll == null || !poll.Options.Contains(selectedOption))
        {
            return BadRequest("Invalid poll or option.");
        }

        var vote = new Vote { PollId = pollId, SelectedOption = selectedOption };
        _context.Votes.Add(vote);
        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpGet("{pollId}/results")]
    public async Task<IActionResult> GetResults(int pollId)
    {
        var poll = await _context.Polls.FindAsync(pollId);
        if (poll == null)
        {
            return NotFound();
        }

        // Seçeneklere göre oyları gruplandırarak sonuçları oluştur
        var results = _context.Votes
            .Where(v => v.PollId == pollId)
            .GroupBy(v => v.SelectedOption)
            .Select(g => new
            {
                Option = g.Key,
                Count = g.Count()
            });

        return Ok(await results.ToListAsync());
    }
}
