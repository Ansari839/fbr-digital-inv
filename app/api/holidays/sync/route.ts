import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const ICAL_URL = 'https://calendar.google.com/calendar/ical/en.pk.official%23holiday%40group.v.calendar.google.com/public/basic.ics';

    const res = await fetch(ICAL_URL);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch public calendar' }, { status: 502 });
    }

    const textData = await res.text();
    const events = textData.split('BEGIN:VEVENT');
    
    let importedCount = 0;

    for (let i = 1; i < events.length; i++) {
      const eventStr = events[i];
      
      // Parse DTSTART (e.g. DTSTART;VALUE=DATE:20260323)
      const dateMatch = eventStr.match(/DTSTART(?:;VALUE=DATE)?:(\d{4})(\d{2})(\d{2})/);
      // Parse SUMMARY (e.g. SUMMARY:Pakistan Day)
      const summaryMatch = eventStr.match(/SUMMARY:(.+)/);
      // Parse DESCRIPTION (optional)
      const descMatch = eventStr.match(/DESCRIPTION:(.+)/);

      if (dateMatch && summaryMatch) {
        const year = dateMatch[1];
        
        // Filter from July 2026 onwards
        if (parseInt(year) >= 2026) {
          const month = dateMatch[2];
          const day = dateMatch[3];
          
          if (parseInt(year) === 2026 && parseInt(month) < 7) {
            continue; // Skip before July 2026
          }

          const eventDate = `${year}-${month}-${day}`;
          const eventName = summaryMatch[1].trim();
          const eventDesc = descMatch ? descMatch[1].trim() : '';

          await prisma.holiday.upsert({
            where: { date: eventDate },
            update: { name: eventName, description: eventDesc },
            create: { date: eventDate, name: eventName, description: eventDesc }
          });
          importedCount++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${importedCount} holidays without any API Key!`,
      count: importedCount
    });

  } catch (error: any) {
    console.error('[Sync Error] Internal Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error during sync' }, { status: 500 });
  }
}
