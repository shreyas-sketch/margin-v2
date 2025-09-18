


"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  HStack,
  Input,
  Spinner,
  Table,
  Text,
} from "@chakra-ui/react";
import Select from "react-select";
import Fuse from "fuse.js";
import SymbolAutocomplete from "../select/SymbolSelect";

const exchanges = [
  { label: "NFO", value: "NFO" },
  { label: "BFO", value: "BFO" },
  { label: "CDS", value: "CDS" },
  { label: "MCX", value: "MCX" },
];

const products = [
  { label: "Futures", value: "Futures" },
  { label: "Options", value: "Options" },
];

const tradesType = [
  { label: "BUY", value: "BUY" },
  { label: "SELL", value: "SELL" },
];

const MarginForm = ({onResult}) => {
  const [formData, setFormData] = useState({
    exchange: exchanges[0],
    product: products[0],
    symbol: null,
    quantity: "",
    strike_price: "",
    option_type: "",
    tradeType: tradesType[0],
    token: ""
  });

  const [symbolData, setSymbolData] = useState([]);
  const [filteredSymbols, setFilteredSymbols] = useState([]);
  const [fuse, setFuse] = useState(null);
  const [symbols, setSymbols] = useState([]);
  const [lotSize, setLotSize] = useState(null);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`/my_data/${formData.exchange}.json`);
        const json = await res.json();

        const formatted = json.map(item => ({
          label: item.symbol,
          value: item.symbol,
          ...item,
        }));

        setSymbolData(formatted);
        setFilteredSymbols(formatted);
        setFuse(new Fuse(formatted, {
          keys: ["name", "symbol", "instrumenttype"],
          threshold: 0.4,
        }));
      } catch (err) {
        console.error("Failed to load symbols", err);
      }
    };
    loadData();
  }, [formData.exchange]);

  useEffect(() => {
    if (!formData.product) {
      setFilteredSymbols(symbolData);
      return;
    }

    const filtered = symbolData.filter(item => {
      const instr = item.instrumenttype?.toUpperCase();
      if (formData.product === "Options") return instr.startsWith("OPT");
      if (formData.product === "Futures") return instr.startsWith("FUT");
      return true;
    });

    setFilteredSymbols(filtered);
  }, [formData.product, symbolData]);

  useEffect(() => {
    console.log("Updated symbols:", symbols);
    // You can also perform other actions here if needed
  }, [symbols]); // runs whenever symbols is updated


  const handleSymbolChange = (val) => {
    setFormData(prev => ({
      ...prev,
      symbol: val,
      exchange: val?.exch_seg,
      quantity: val?.lotsize ? String(val.lotsize) : "",
      strike_price: val?.strike ? String(parseInt(val.strike / 100)) : "",
      option_type: val?.symbol?.endsWith("PE") ? "PUTS" :
                   val?.symbol?.endsWith("CE") ? "CALLS" : "",
      token: val?.token || ""
    }));
    setLotSize(val?.lotsize || null);
  };

  const handleSubmit = async () => {
    let positions;
    if(symbols.length !== 0) {
      positions = symbols
      .filter(item => item.exchange && item.token) // Only valid items
      .map(item => ({
        exchange: item.exchange,
        qty: item.qty,
        productType: "INTRADAY",
        token: item.token,
        tradeType: item.tradeType,
        orderType: "MARKET"
      }));
    } else {
      positions = [
        {
          "exchange": formData.exchange, 
          "qty": formData.quantity || lotSize,
          "productType": "INTRADAY",
          "token": formData.token,
          "tradeType": formData.tradeType,
          "orderType": "MARKET"
        }
      ]
    }
    console.log(positions)
    setLoading(true);
    try {
      const res = await fetch('/api/smartapi/margin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({positions}),
      });
      const data = await res.json();
      console.log(data)
      if(data && onResult) {
        onResult(data)
      }
    } catch (err) {
      console.error('Error fetching margin:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="block" w={{ base: "100%", lg: "70%" }}>
      <Box mt={6} bg="white" boxShadow="lg" py={6} px={6} w="96%" mx="2%" borderRadius="lg">
        
        {/* Exchange */}
        <Text mb={1}>Exchange</Text>
        <Select
          options={exchanges}
          value={exchanges.find(opt => opt.value === formData.exchange)}
          onChange={(val) =>
            setFormData({ ...formData, exchange: val.value, symbol: null })
          }
        />

        {/* Product */}
        <Text mt={4} mb={1}>Product</Text>
        <Select
          options={products}
          value={products.find(opt => opt.value === formData.product)}
          onChange={(val) =>
            setFormData({ ...formData, product: val.value, symbol: null })
          }
        />

        {/* Symbol */}
        <SymbolAutocomplete
          symbolData={filteredSymbols}
          value={formData.symbol}
          onChange={handleSymbolChange}
        />

        {/* Options-specific fields */}
        {formData.product === "Options" && (
          <>
            <Text mt={4} mb={1}>Option Type</Text>
            <Input value={formData.option_type} placeholder="Option Type" disabled />

            <Text mt={4} mb={1}>Strike Price</Text>
            <Input value={formData.strike_price} placeholder="Strike Price" disabled />
          </>
        )}

        {/* Quantity */}
        <HStack justify="space-between" fontFamily="onest">
          <Text mt={4} mb={1}>Quantity</Text>
          {lotSize && (
            <Text mt={5} fontSize="xs" color="blue.500">
              Lot Size: {lotSize}
            </Text>
          )}
        </HStack>
        <Input
          fontFamily="onest"
          onChange={(e) => setFormData({ ...formData, quantity: lotSize })}
          value={formData.quantity}
          placeholder="Quantity"
          disabled
        />

        {/* Trade Type */}
        <Box my={4} fontFamily="onest">
          <Text mb={1}>Trade Type</Text>
          <Select
            options={tradesType}
            value={tradesType.find(opt => opt.value === formData.tradeType)}
            onChange={(val) =>
              setFormData({ ...formData, tradeType: val.value })
            }
          />
        </Box>

        {/* Buttons */}
        <HStack gap={6}>
          <Button mt={6} bg="#fff47c" color='black' onClick={handleSubmit} borderRadius={loading ? "full" : 'sm'} boxShadow='lg'>
            {loading ? <Spinner size='sm' /> : "Submit"}
          </Button>
          <Button
            mt={6}
            onClick={() => {
              if (!formData.symbol) return;
              const data = {
                symbol: formData.symbol?.value,
                exchange: formData.exchange,
                tradeType: formData.tradeType,
                token: formData.token,
                qty: lotSize,
                productType: "INTRADAY",
                orderType: 'MARKET'

              };
              setSymbols(prev => [...prev, data]);
            }}
            bg="#f4f4f4" color='black'
          >
            Add Symbol
          </Button>
        </HStack>
      </Box>

      {/* Symbol Table */}
      <Table.Root
        boxShadow="lg"
        w="96%"
        size="sm"
        striped
        variant="outline"
        borderRadius="lg"
        my={6}
        mx="2%"
      >
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Symbol</Table.ColumnHeader>
            <Table.ColumnHeader>Exchange</Table.ColumnHeader>
            <Table.ColumnHeader>Quantity</Table.ColumnHeader>
            <Table.ColumnHeader>Type</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {symbols.map((item, idx) => (
            <Table.Row key={idx}>
              <Table.Cell>{item.symbol}</Table.Cell>
              <Table.Cell>{item.exchange}</Table.Cell>
              <Table.Cell>{item.qty}</Table.Cell>
              <Table.Cell>{item.tradeType}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

export default MarginForm;
