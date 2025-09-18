// import MarginForm from "@/components/forms/MarginForm"
import AssetsListTable from "@/components/tables/AssetsListTable"
import { Box } from "@chakra-ui/react"
import { useEffect, useState } from "react"

const CommodityContent = () => {
  const [data, setData] = useState([])

  useEffect(() => {
    const fetchEquityFuturesData = async () => {
      const res = await fetch(`/my_data/MCX.json`)
      const json = await res.json()
      setData(json)
    }

    fetchEquityFuturesData()
  }, [])

  return (
    <Box gap={12} w={{ base: "100%", lg: "60%" }}>
      <AssetsListTable data={data} />
    </Box>
  )
}

export default CommodityContent
