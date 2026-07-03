module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]();
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/app/api/termine/verfuegbarkeit/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
;
;
async function GET(request) {
    const { searchParams } = new URL(request.url);
    const datum = searchParams.get("datum");
    const arztId = searchParams.get("arztId");
    if (!datum) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Datum erforderlich (YYYY-MM-DD)"
        }, {
            status: 400
        });
    }
    const selectedDate = new Date(datum + "T00:00:00Z");
    const tag = selectedDate.getUTCDay(); // 0=Sonntag, 6=Samstag
    const isWeekend = tag === 0 || tag === 6;
    // Prüfen auf Praxisschließung
    const schliessung = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].abwesenheitsereignis.findFirst({
        where: {
            betrifftGanzePraxis: true,
            startDatum: {
                lte: selectedDate
            },
            endDatum: {
                gte: selectedDate
            }
        }
    });
    if (schliessung) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            verfuegbar: false,
            termine: [],
            grund: `Praxis geschlossen: ${schliessung.grund || "Praxisschließung"}`
        });
    }
    if (isWeekend) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            verfuegbar: false,
            termine: [],
            grund: "Wochenende"
        });
    }
    // Ärzte laden
    const aerzte = arztId ? await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].arzt.findMany({
        where: {
            id: parseInt(arztId),
            aktiv: true
        },
        include: {
            sprechzeiten: true,
            abwesenheiten: {
                where: {
                    startDatum: {
                        lte: selectedDate
                    },
                    endDatum: {
                        gte: selectedDate
                    }
                }
            }
        }
    }) : await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].arzt.findMany({
        where: {
            aktiv: true
        },
        include: {
            sprechzeiten: true,
            abwesenheiten: {
                where: {
                    startDatum: {
                        lte: selectedDate
                    },
                    endDatum: {
                        gte: selectedDate
                    }
                }
            }
        }
    });
    // Terminarten laden (online buchbare)
    const terminarten = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].terminart.findMany({
        where: {
            onlineBuchbar: true,
            aktiv: true
        }
    });
    // Bestehende Termine am selectedDate laden
    const buchungen = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].termin.findMany({
        where: {
            datum: selectedDate,
            status: {
                notIn: [
                    "abgesagt",
                    "arzt_ausfall_betroffen"
                ]
            }
        }
    });
    const slots = [];
    for (const arzt of aerzte){
        // Arzt abwesend?
        const abwesend = arzt.abwesenheiten.length > 0;
        if (abwesend) continue;
        for (const sz of arzt.sprechzeiten){
            if (sz.tag !== tag) continue;
            const [startH, startM] = sz.startzeit.split(":").map(Number);
            const [endH, endM] = sz.endzeit.split(":").map(Number);
            const startMin = startH * 60 + startM;
            const endMin = endH * 60 + endM;
            for (const ta of terminarten){
                const dauer = ta.defaultDauerMin;
                for(let t = startMin; t + dauer <= endMin; t += 15){
                    const slotStart = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
                    const slotEndMin = t + dauer;
                    const slotEnd = `${String(Math.floor(slotEndMin / 60)).padStart(2, "0")}:${String(slotEndMin % 60).padStart(2, "0")}`;
                    // Kollision mit bestehenden Buchungen?
                    const kollidiert = buchungen.some((b)=>{
                        if (b.arztId !== arzt.id || b.terminartId !== ta.id) return false;
                        const [bSH, bSM] = b.startzeit.split(":").map(Number);
                        const [bEH, bEM] = b.endzeit.split(":").map(Number);
                        const bStart = bSH * 60 + bSM;
                        const bEnd = bEH * 60 + bEM;
                        return t < bEnd && t + dauer > bStart;
                    });
                    if (!kollidiert) {
                        slots.push({
                            arztId: arzt.id,
                            arztName: arzt.name,
                            terminartId: ta.id,
                            terminartName: ta.name,
                            datum,
                            startzeit: slotStart,
                            endzeit: slotEnd,
                            dauer
                        });
                    }
                }
            }
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        verfuegbar: true,
        termine: slots
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1aaey-v._.js.map