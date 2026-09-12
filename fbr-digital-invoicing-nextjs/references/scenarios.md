# Sandbox Testing Scenarios (SN001–SN028)

During sandbox testing, the taxpayer must submit at least one successful test invoice for **each scenario assigned to their selected Business Nature + Sector** combination (chosen during the Technical Details step in IRIS — see `pral-integration.md`).

## Scenario list

| ID | Description | Sale Type to use |
|---|---|---|
| SN001 | Goods at standard rate to registered buyers | Goods at Standard Rate (default) |
| SN002 | Goods at standard rate to unregistered buyers | Goods at Standard Rate (default) |
| SN003 | Sale of Steel (Melted and Re-Rolled) | Steel Melting and re-rolling |
| SN004 | Sale by Ship Breakers | Ship breaking |
| SN005 | Reduced rate sale | Goods at Reduced Rate |
| SN006 | Exempt goods sale | Exempt Goods |
| SN007 | Zero rated sale | Goods at zero-rate |
| SN008 | Sale of 3rd schedule goods | 3rd Schedule Goods |
| SN009 | Cotton Spinners purchase from Cotton Ginners (Textile) | Cotton Ginners |
| SN010 | Telecom services rendered | Telecommunication services |
| SN011 | Toll Manufacturing sale by Steel sector | Toll Manufacturing |
| SN012 | Sale of Petroleum products | Petroleum Products |
| SN013 | Electricity Supply to Retailers | Electricity Supply to Retailers |
| SN014 | Sale of Gas to CNG stations | Gas to CNG stations |
| SN015 | Sale of mobile phones | Mobile Phones |
| SN016 | Processing / Conversion of Goods | Processing/Conversion of Goods |
| SN017 | Sale of Goods, FED charged in ST mode | Goods (FED in ST Mode) |
| SN018 | Services, FED charged in ST mode | Services (FED in ST Mode) |
| SN019 | Services rendered or provided | Services |
| SN020 | Sale of Electric Vehicles | Electric Vehicle |
| SN021 | Sale of Cement/Concrete Block | Cement/Concrete Block |
| SN022 | Sale of Potassium Chlorate | Potassium Chlorate |
| SN023 | Sale of CNG | CNG Sales |
| SN024 | Goods sold per SRO 297(1)/2023 | Goods as per SRO.297(I)/2023 |
| SN025 | Drugs at fixed ST rate (8th Schedule Table 1, Sr. 81) | Non-Adjustable Supplies |
| SN026 | Sale to End Consumer by retailers | Goods at Standard Rate (default) |
| SN027 | Sale to End Consumer by retailers | 3rd Schedule Goods |
| SN028 | Sale to End Consumer by retailers | Goods at Reduced Rate |

**Note:** SN026, SN027, SN028 apply only if the taxpayer is registered as a retailer in their sales tax profile.

## Business Activity × Sector → applicable scenarios

The full official mapping is a large lookup table (Business Activity: Manufacturer / Importer / Distributor / Wholesaler / Exporter / Retailer / Service Provider / Other, crossed with Sector: Steel, FMCG, Textile, Telecom, Petroleum, Electricity/Gas Distribution, Services, Automobile, CNG Stations, Pharmaceuticals, Wholesale/Retails, All Other Sectors).

**Pattern to note for the app:**
- Almost every Business Activity + "All Other Sectors" combination gets the same **core bundle**: SN001, SN002, SN005, SN006, SN007, SN015, SN016, SN017, SN021, SN022, SN024.
- Specific sectors add **one or two sector-specific scenarios** on top of that core bundle (e.g. Steel sector adds SN003, SN004, SN011; Telecom adds SN010; Textile adds SN009; Services adds SN018 + SN019; Wholesale/Retail adds SN026, SN027, SN028, SN008).
- **Distributor and Wholesaler activities are a special case**: they generally do NOT get the full core bundle — they mostly get just their sector-specific scenario plus SN026/SN027/SN028/SN008 (the retail-facing ones), since their business nature is redistribution rather than the original manufacture/import/sale.
- Retailer activity typically gets the core bundle **plus** SN026/SN027/SN028/SN008 for "All Other Sectors", but narrows to just the sector-specific + SN026/027/028/008 for named sectors.
- Service Provider activity swaps the core bundle's SN015/016/017/021/022/024 pattern for **SN018 + SN019** (services-focused) plus sector-specific additions.

**Implementation recommendation:** rather than hardcoding this full matrix in application logic, store it as static seed/config data (e.g. a JSON lookup keyed by `businessActivity + sector`) since it's official reference data unlikely to change often, and surface it during the IRIS technical-details step planning — this app itself doesn't call an API for this mapping; it's used to know which scenarios the *taxpayer* needs to clear in *IRIS's* sandbox UI, not something this app posts to FBR directly. It's most useful as an internal checklist/dashboard so the business knows which test invoices still need to be submitted through IRIS/PRAL's own sandbox testing screen.
