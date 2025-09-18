"use client"

import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react"

const MarginDialog = ({ open, onOpenChange }) => {
  return (
    <Dialog.Root lazyMount open={open} onOpenChange={onOpenChange}>
      <Portal>
        {/* Optional: Uncomment if you want a backdrop */}
        {/* <Dialog.Backdrop /> */}
        <Dialog.Positioner>
          <Dialog.Content boxShadow='sm'>
            <Dialog.Header>
              <Dialog.Title>Dialog Title</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              {/* Add content here */}
            </Dialog.Body>

            <Dialog.Footer>
              <Button
                variant="outline"
                onClick={() => onOpenChange({ open: false })}
              >
                Cancel
              </Button>
              <Button onClick={() => onOpenChange({ open: false })}>Save</Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default MarginDialog
