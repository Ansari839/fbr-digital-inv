import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import os from "os";

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercentage = (usedMem / totalMem) * 100;
    
    const loadAvg = os.loadavg();
    const cpus = os.cpus().length;
    // rough approximation of CPU usage using load average over 1 min
    const cpuPercentage = (loadAvg[0] / cpus) * 100;

    const uptimeSeconds = os.uptime();
    const days = Math.floor(uptimeSeconds / (3600 * 24));
    const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);

    return Response.json({
      cpu: {
        cores: cpus,
        usagePercentage: cpuPercentage.toFixed(1)
      },
      memory: {
        totalGb: (totalMem / 1024 / 1024 / 1024).toFixed(1),
        usedGb: (usedMem / 1024 / 1024 / 1024).toFixed(1),
        usagePercentage: memPercentage.toFixed(1)
      },
      uptime: {
        days,
        hours,
        minutes,
        formatted: `${days}d ${hours}h ${minutes}m`
      }
    });
  } catch (error: any) {
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
