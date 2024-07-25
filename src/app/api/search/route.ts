import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { PartResult } from '../../../types';

const USD_TO_INR = 84;
const EUR_TO_INR = 90;

interface PriceBreak {
    Quantity: number;
    quantity: number;
    Price: string;
    from: number;
    to: number;
    cost: number;
  }
  

const apiKeys = {
  mouser: '82675baf-9a58-4d5a-af3f-e3bbcf486560',
  element14: 'wb9wt295qf3g6m842896hh2u',
  rutronik: 'cc6qyfg2yfis',
};

export function convertToINR(price: number, currency: string): number {
  switch (currency.toUpperCase()) {
    case 'USD':
      return price * USD_TO_INR;
    case 'EUR':
      return price * EUR_TO_INR;
    case 'INR':
      return price;
    default:
      console.warn(`Unknown currency: ${currency}. Returning original price.`);
      return price;
  }
}

async function searchMouser(partNumber: string, volume: number): Promise<PartResult | null> {
  try {
    const response = await axios.post(
      `https://api.mouser.com/api/v1/search/partnumber?apiKey=${apiKeys.mouser}`,
      {
        SearchByPartRequest: {
          mouserPartNumber: partNumber,
          partSearchOptions: "string"
        }
      }
    );

    const part = response.data.SearchResults.Parts[0];
    if (!part) return null;

    const priceBreaks = part.PriceBreaks.map((pb: any) => ({
      Quantity: parseInt(pb.Quantity),
      Price: pb.Price.replace(/[^\d.]/g, ''),  
    }));

    const priceBreak = priceBreaks.reduce((prev: PriceBreak, current: PriceBreak) => {
      return (current.Quantity <= volume && current.Quantity > prev.Quantity) ? current : prev;
    }, { Quantity: 0, Price: '0' });

    const unitPrice = parseFloat(priceBreak.Price);

    return {
      partNumber,
      manufacturer: part.Manufacturer,
      dataProvider: 'Mouser',
      volume,
      unitPrice,
      totalPrice: unitPrice * volume,
      priceBreaks,
    };
  } catch (error) {
    console.error('Error searching Mouser:', error);
    return null;
  }
}

  async function searchElement14(partNumber: string, volume: number): Promise<PartResult | null> {
    try {
      const response = await axios.get('http://api.element14.com/catalog/products', {
        params: {
          term: `manuPartNum:${partNumber}`,
          'storeInfo.id': 'in.element14.com',
          'resultsSettings.offset': 0,
          'resultsSettings.numberOfResults': 1,
          'resultsSettings.refinements.filters': 'inStock',
          'resultsSettings.responseGroup': 'medium',
          'callInfo.omitXmlSchema': false,
          'callInfo.callback': '',
          'callInfo.responseDataFormat': 'json',
          'callinfo.apiKey': apiKeys.element14,
        }
      });
  
      const part = response.data.manufacturerPartNumberSearchReturn.products[0];
      if (!part) return null;
  
      const priceBreak = part.prices.reduce((prev: PriceBreak, current: PriceBreak) => {
        return (current.from <= volume && current.from > prev.from) ? current : prev;
      });
  
      const unitPriceOriginal = (priceBreak.cost);
      const unitPriceINR =  convertToINR(unitPriceOriginal, 'INR');
      return {
        partNumber,
        manufacturer: part.vendorName,
        dataProvider: 'Element14',
        volume,
        unitPrice: unitPriceINR,
        totalPrice: unitPriceINR * volume,
        priceBreaks: part.prices,
      };
    } catch (error) {
      console.error('Error searching Element14:', error);
      return null;
    }
  }


  async function searchRutronik(partNumber: string, volume: number): Promise<PartResult | null> {
    try {
      const response = await axios.get('https://www.rutronik24.com/api/search/', {
        params: {
          apikey: apiKeys.rutronik,
          searchterm: partNumber,
        }
      });
  
      const part = response.data[0];
      if (!part) return null;
  
      console.log(part);
  
      
      const sortedPriceBreaks = part.pricebreaks.sort((a: PriceBreak, b: PriceBreak) => a.quantity - b.quantity);
      console.log(sortedPriceBreaks);
  
     
      let priceBreak = sortedPriceBreaks[0]; 
      for (const pb of sortedPriceBreaks) {
        if (volume >= pb.quantity) {
          priceBreak = pb;
        } else {
          break;
        }
      }
  
      console.log(priceBreak);
  
      const unitPriceEUR = parseFloat(priceBreak.price);
      const unitPriceINR = convertToINR(unitPriceEUR, 'EUR');
  
      return {
        partNumber,
        manufacturer: part.manufacturer,
        dataProvider: 'Rutronik',
        volume,
        unitPrice: unitPriceINR,
        totalPrice: unitPriceINR * volume,
        priceBreaks: part.pricebreaks,
      };
    } catch (error) {
      console.error('Error searching Rutronik:', error);
      return null;
    }
  }
  

export async function POST(request: NextRequest) {
  try {
    const { partNumber, volume } = await request.json();

    if (!partNumber || !volume) {
      return NextResponse.json({ error: 'Part number and volume are required' }, { status: 400 });
    }

    const results = await Promise.all([
      searchMouser(partNumber, volume),
      searchElement14(partNumber, volume),
      searchRutronik(partNumber, volume)
    ]);

    const validResults = results.filter((result): result is PartResult => result !== null);

    if (validResults.length === 0) {
      return NextResponse.json({ error: 'No results found for the given part number' }, { status: 404 });
    }

    validResults.sort((a, b) => {
      if (a.totalPrice !== undefined && b.totalPrice !== undefined) {
        return a.totalPrice - b.totalPrice;
      }
      return 0;
    });

    return NextResponse.json(validResults);
  } catch (error) {
    console.error('Error processing search:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}